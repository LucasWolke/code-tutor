import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { AIProvider, EnhancedChatMessage, HelpLevel, TutorContext } from "@/types/chat";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
    HELP_LEVEL_ASSESSOR_PROMPT,
    TUTOR_PROMPTS,
    createConsistencyCheckerPrompt
} from "@/lib/config/prompts";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { getDefaultModel, getModelById } from "@/lib/config/models";

/**
 * Create a LangChain model based on model ID
 */
function createModelInstance(modelId?: string, temperature: number = 0.3): BaseChatModel {
    // Get model config or use default if not found
    const modelConfig = modelId ? getModelById(modelId) : getDefaultModel();

    // Create the appropriate model instance
    if (modelConfig?.provider === AIProvider.OpenAI) {
        return new ChatOpenAI({
            model: modelConfig.id,
            temperature: temperature
        });
    } else {
        // Default to Gemini
        return new ChatGoogleGenerativeAI({
            model: modelConfig?.id || "gemini-2.0-flash",
            temperature: temperature
        });
    }
}

/**
 * Level Assessor: Analyzes user message and code to determine appropriate help level
 */
export async function assessHelpLevel(modelId: string, message: EnhancedChatMessage): Promise<HelpLevel> {
    // Use a model with lower temperature for assessment
    const assessorModel = createModelInstance(modelId, 0);
    const systemMessage = SystemMessagePromptTemplate.fromTemplate(HELP_LEVEL_ASSESSOR_PROMPT);

    const assessorPrompt = ChatPromptTemplate.fromMessages(
        [
            systemMessage,
            message
        ])
        .pipe(assessorModel);

    const response = await assessorPrompt.invoke({});

    // Extract the help level from response (should be a single number)
    const levelMatch = response.text.match(/[0-5]/);
    return levelMatch ? parseInt(levelMatch[0], 10) as HelpLevel : HelpLevel.Unrelated;
}

/**
 * Creates a router chain that delegates to the appropriate tutor agent based on help level
 */
export async function createTutorRouterChain() {
    return {
        invoke: async function (context: TutorContext) {
            // Ensure the context has all required properties
            if (!context || !context.chatHistory) {
                throw new Error("Invalid context provided to tutor router");
            }

            // Select the appropriate agent based on the help level
            const helpLevel = context.helpLevel || HelpLevel.Motivational;
            const systemMessage = SystemMessagePromptTemplate.fromTemplate(TUTOR_PROMPTS[helpLevel]);


            const tutorModel = createModelInstance(context.modelId, 0.3);

            const tutorPrompt = ChatPromptTemplate.fromMessages(
                [
                    systemMessage,
                    ...context.chatHistory,
                ])
                .pipe(tutorModel);

            console.log("Tutor prompt: ", tutorPrompt);

            // Invoke the agent with the properly formatted context
            const response = await tutorPrompt.invoke({
                code: context.code,
                testResults: context.testResults,
                feedbackForRetry: context.feedbackForRetry,
                additionalResources: context.additionalResources || []
            });

            return response;
        }
    };
}

/**
 * Consistency Checker: Verifies that the tutor's response matches the assigned help level
 */
export async function checkResponseConsistency(
    response: string,
    helpLevel: HelpLevel,
    modelId?: string
): Promise<{ isConsistent: boolean, feedback?: string }> {
    const checkerModel = createModelInstance(modelId, 0);
    const checkerPrompt = ChatPromptTemplate.fromTemplate(
        createConsistencyCheckerPrompt(helpLevel)
    );

    const checkerChain = checkerPrompt
        .pipe(checkerModel)
        .pipe(new StringOutputParser());

    const result = await checkerChain.invoke({
        tutorResponse: response
    });

    console.log("Consistency check result:", result);

    const isConsistent = result.toLowerCase().includes("yes");

    return {
        isConsistent,
        feedback: isConsistent ? undefined : result
    };
}