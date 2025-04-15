/**
 * Options for AI model generation
 */
export interface AIModelOptions {
    modelName?: string;
}

/**
 * Response from AI generation
 */
export interface AIResponse {
    text: string;
    model: string;
    finishReason?: string;
}

/**
 * Error from AI generation
 */
export interface AIError {
    message: string;
    type: string;
    param?: string;
    code?: string;
}

/**
 * Chat message structure
 */
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}