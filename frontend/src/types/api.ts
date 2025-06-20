import { EnhancedChatMessage, HelpLevel } from "@/types/chat";
import { TestRunResult } from "./code";

export interface ExecuteRequest {
    main: string;
    stdin?: string;
    timeoutMs?: number;
}

export interface ExecuteResponse {
    output: string;
    success: boolean;
    error?: string;
    exitCode?: number;
    stderr?: string;
    stdout?: string;
}

/**
 * Request payload for the chat API
 */
export interface ChatRequest {
    code: string;
    chatHistory: EnhancedChatMessage[];
    helpLevel?: HelpLevel; // Optional if we want to override the assessed level
    modelId?: string; // Optional model ID to use for generation
    testResults?: TestRunResult;
    additionalResources?: string[]; // Optional additional resources for context
    strict: boolean; // Whether to check response consistency
}

/**
 * Response payload from the chat API
 */
export interface ChatResponse {
    responseText: string;
    helpLevel: HelpLevel;
}