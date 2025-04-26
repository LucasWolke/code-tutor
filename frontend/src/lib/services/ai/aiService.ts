import { AIModelOptions } from './types';
import { HelpLevel } from '@/lib/langchain/types';
import { v4 as uuidv4 } from 'uuid';

// Default session ID if none provided
const defaultSessionId = uuidv4();

/**
 * Service to interact with AI models through our API
 */
class AIService {
    private modelName: string = 'openai';
    private apiUrl: string;
    private sessionId: string;
    private userId: string;

    constructor() {
        // Use environment variable or default to local development
        this.apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
        this.sessionId = defaultSessionId;
        this.userId = 'anonymous-' + this.sessionId.substring(0, 8);
    }

    /**
     * Set which AI model to use
     */
    setModel(model: string): AIService {
        this.modelName = model;
        return this;
    }

    /**
     * Get the currently active model name
     */
    getModel(): string {
        return this.modelName;
    }

    /**
     * Set session ID for conversation tracking
     */
    setSessionId(sessionId: string): AIService {
        this.sessionId = sessionId;
        return this;
    }

    /**
     * Set user ID for conversation tracking
     */
    setUserId(userId: string): AIService {
        this.userId = userId;
        return this;
    }

    /**
     * Generate AI response using our 5-level tutoring system
     */
    async generateResponse(
        prompt: string,
        code: string,
        options: AIModelOptions & { helpLevel?: HelpLevel } = {}
    ): Promise<{ text: string; helpLevel: HelpLevel }> {
        try {
            const response = await fetch(`${this.apiUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.userId,
                    sessionId: this.sessionId,
                    codeSnapshot: code,
                    userMessage: prompt,
                    helpLevel: options.helpLevel,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`AI chat error: ${response.status} - ${errorData.error || 'Unknown error'}`);
            }

            const data = await response.json();
            return {
                text: data.responseText,
                helpLevel: data.helpLevel
            };
        } catch (error) {
            console.error('AI chat error:', error);
            throw error;
        }
    }
}

// Create a singleton instance
export const aiService = new AIService();

// Export convenience methods
export const generateResponse = (prompt: string, code: string, options?: AIModelOptions & { helpLevel?: HelpLevel }) => {
    return aiService.generateResponse(prompt, code, options);
};