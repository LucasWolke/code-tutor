import { BaseMessage } from "@langchain/core/messages";

/**
 * Help levels for the tutor system, there are 5 levels of help:
 */
export enum HelpLevel {
    Motivational = 1,
    Feedback = 2,
    GeneralStrategy = 3,
    ContentStrategy = 4,
    Contextual = 5
}
/**
 * Request payload for the chat API
 */
export interface ChatRequest {
    userId: string;
    sessionId: string;
    codeSnapshot: string;
    userMessage: string;
    helpLevel?: HelpLevel; // Optional if we want to override the assessed level
    modelId?: string; // Optional model ID to use for generation
}

/**
 * Response payload from the chat API
 */
export interface ChatResponse {
    responseText: string;
    helpLevel: HelpLevel;
}

/**
 * Structured data for the tutor agent context
 */
export interface TutorContext {
    userId: string;
    sessionId: string;
    code: string;
    userMessage: string;
    helpLevel: HelpLevel;
    chat_history?: BaseMessage[];
    modelId?: string; // The AI model to use
    feedbackForRetry?: string; // Feedback for retry attempts
}