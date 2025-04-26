import { BaseMessage } from "@langchain/core/messages";

/**
 * Help levels for the tutor system
 * 1: Minimal hints
 * 2: Light coaching
 * 3: Medium instruction
 * 4: Detailed debugging
 * 5: Full solution
 */
export enum HelpLevel {
    MinimalHints = 1,
    LightCoaching = 2,
    MediumInstruction = 3,
    DetailedDebugging = 4,
    FullSolution = 5
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
}