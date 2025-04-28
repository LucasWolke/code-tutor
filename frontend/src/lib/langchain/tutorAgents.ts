import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HelpLevel, TutorContext } from "./types";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
    HELP_LEVEL_ASSESSOR_PROMPT,
    TUTOR_PROMPTS,
    CONTEXT_SUMMARY_PROMPT,
    createConsistencyCheckerPrompt
} from "./prompts";
import { getRoleFromMessage } from "./memory";

// Create a single Google Generative AI instance to be reused
const defaultModel = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0.3
});

// Higher quality model for level assessment
const assessorModel = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0
});

/**
 * Level Assessor: Analyzes user message and code to determine appropriate help level
 */
export async function assessHelpLevel(context: Omit<TutorContext, "helpLevel">): Promise<HelpLevel> {
    const assessorPrompt = ChatPromptTemplate.fromTemplate(HELP_LEVEL_ASSESSOR_PROMPT);
    const assessorChain = assessorPrompt.pipe(assessorModel).pipe(new StringOutputParser());

    const response = await assessorChain.invoke({
        code: context.code,
        userMessage: context.userMessage,
        chat_history: formatChatHistory(context.chat_history || [])
    });

    console.log("Help level assessment response:", response);

    // Extract the help level from response (should be a single number)
    const levelMatch = response.match(/[1-5]/);
    return levelMatch ? parseInt(levelMatch[0], 10) as HelpLevel : HelpLevel.Motivational;
}

/**
 * Format chat history into a readable string
 */
function formatChatHistory(chatHistory: any[]): string {
    if (!chatHistory || !Array.isArray(chatHistory) || chatHistory.length === 0) {
        return "No prior conversation.";
    }

    return chatHistory
        .map(msg => {
            const role = getRoleFromMessage(msg);
            console.log("Message role:", role);
            const content = msg.content || msg.text || "";
            return `${role}: ${content}`;
        })
        .join("\n");
}

/**
 * Creates a tutor agent for a specific help level
 */
function createTutorAgent(helpLevel: HelpLevel) {
    const tutorModel = new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash",
        temperature: 0.3,
    });

    return ChatPromptTemplate.fromTemplate(TUTOR_PROMPTS[helpLevel])
        .pipe(tutorModel)
        .pipe(new StringOutputParser());
}

/**
 * Creates a router chain that delegates to the appropriate tutor agent based on help level
 */
export async function createTutorRouterChain() {
    return {
        invoke: async function (context: TutorContext) {
            // Ensure the context has all required properties
            if (!context || !context.userMessage) {
                throw new Error("Invalid context provided to tutor router");
            }

            // Format chat history if it exists
            const formattedHistory = formatChatHistory(context.chat_history || []);

            // Select the appropriate agent based on the help level
            const helpLevel = context.helpLevel || HelpLevel.Motivational;
            const agent = createTutorAgent(helpLevel);

            // Invoke the agent with the properly formatted context
            const response = await agent.invoke({
                code: context.code,
                userMessage: context.userMessage,
                chat_history: formattedHistory
            });

            return response;
        }
    };
}

/**
 * Context Summarizer: Creates summaries of the current tutoring context
 */
export async function summarizeContext(context: TutorContext): Promise<string> {
    const summaryPrompt = ChatPromptTemplate.fromTemplate(CONTEXT_SUMMARY_PROMPT);

    const summaryChain = summaryPrompt
        .pipe(defaultModel)
        .pipe(new StringOutputParser());

    const response = await summaryChain.invoke({
        code: context.code,
        userMessage: context.userMessage,
    });

    return response;
}

/**
 * Consistency Checker: Verifies that the tutor's response matches the assigned help level
 */
export async function checkResponseConsistency(
    response: string,
    helpLevel: HelpLevel,
): Promise<{ isConsistent: boolean, feedback?: string }> {
    const checkerPrompt = ChatPromptTemplate.fromTemplate(
        createConsistencyCheckerPrompt(helpLevel)
    );

    const checkerChain = checkerPrompt
        .pipe(assessorModel)
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