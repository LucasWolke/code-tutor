import { HelpLevel } from '@/lib/langchain/types';
import { v4 as uuidv4 } from 'uuid';
import { getDefaultModel, getModelById } from '@/lib/langchain/tutorAgents';
import { availableModels } from '@/lib/config/models';
// Default session ID if none provided
const defaultSessionId = uuidv4();

/**
 * Service to interact with AI models
 */
class AIService {
    private apiUrl: string;
    private sessionId: string;
    private userId: string;
    private selectedModelId: string;

    constructor() {
        this.apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
        // IDs for logging purposes
        this.sessionId = defaultSessionId;
        this.userId = 'anonymous-' + this.sessionId.substring(0, 8);

        // Set default model
        const defaultModel = getDefaultModel();
        this.selectedModelId = defaultModel.id;
    }

    /**
     * Get list of all available models
     */
    getAvailableModels() {
        return availableModels;
    }

    /**
     * Set which AI model to use by ID
     */
    setModel(modelId: string): AIService {
        const model = getModelById(modelId);
        if (!model) {
            console.warn(`Model '${modelId}' is not available, using default model`);
            this.selectedModelId = getDefaultModel().id;
        } else {
            this.selectedModelId = modelId;
        }
        return this;
    }

    /**
     * Get the currently selected model ID
     */
    getSelectedModelId(): string {
        return this.selectedModelId;
    }

    /**
     * Get the currently selected model configuration
     */
    getSelectedModel() {
        const model = getModelById(this.selectedModelId);
        if (!model) {
            const defaultModel = getDefaultModel();
            this.selectedModelId = defaultModel.id;
            return defaultModel;
        }
        return model;
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
     * Generate AI response using the selected model
     */
    async generateResponse(
        prompt: string,
        code: string,
        terminalOutput?: string,
        options: { helpLevel?: HelpLevel } = {}
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
                    modelId: this.selectedModelId,
                    terminalOutput: terminalOutput,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`AI error: ${response.status} - ${errorData.error || 'Unknown error'}`);
            }

            const data = await response.json();
            return {
                text: data.responseText,
                helpLevel: data.helpLevel
            };
        } catch (error) {
            console.error('AI generation error:', error);
            throw error;
        }
    }
}

// Create a singleton instance
export const aiService = new AIService();

// Export convenience methods
export const generateResponse = (
    prompt: string,
    code: string,
    terminalOutput?: string,
    options?: { helpLevel?: HelpLevel }
) => {
    return aiService.generateResponse(prompt, code, terminalOutput, options);
};