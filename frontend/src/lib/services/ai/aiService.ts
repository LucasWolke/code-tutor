import { AIModelOptions } from './types';

/**
 * Service to interact with AI models through our API
 */
class AIService {
    private modelName: string = 'gemini';

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
     * Generate AI response using the current model
     */
    async generateResponse(
        prompt: string,
        code: string,
        options: AIModelOptions = {}
    ): Promise<string> {
        try {
            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    code,
                    options,
                    model: this.modelName,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`AI service error: ${response.status} - ${errorData.error || 'Unknown error'}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('AI service error:', error);
            throw error;
        }
    }
}

// Create a singleton instance
export const aiService = new AIService();

// Export convenience method
export const generateResponse = (prompt: string, code: string, options?: AIModelOptions) => {
    return aiService.generateResponse(prompt, code, options);
};