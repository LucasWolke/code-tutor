import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";

// Enhanced chat message with help level
export type EnhancedChatMessage = (HumanMessage | AIMessage | SystemMessage) & {
    helpLevel?: HelpLevel;
    isLoading?: boolean;
};

/**
 * Help levels for the tutor system, there are 5 levels of help:
 */
export enum HelpLevel {
    Unrelated = 0,
    Motivational = 1,
    Feedback = 2,
    GeneralStrategy = 3,
    ContentStrategy = 4,
    Contextual = 5,
    Finished = 6,
}

/**
 * Structured data for the tutor agent context
 */
export interface TutorContext {
    code: string;
    helpLevel: HelpLevel;
    chatHistory?: EnhancedChatMessage[];
    modelId?: string; // The AI model to use
    testResults?: string; // Optional test results for context
    feedbackForRetry?: string; // Feedback for retry attempts
    additionalResources?: string; // Additional resources for context
}

export enum AIProvider {
    OpenAI = "openai",
    Gemini = "gemini",
}

export interface ModelConfig {
    id: string;
    name: string;
    provider: AIProvider;
    description?: string;
    isDefault?: boolean;
}