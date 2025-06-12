import { AIProvider, ModelConfig } from "@/types/chat";

export const availableModels: ModelConfig[] = [
    {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        provider: AIProvider.Gemini,
        description: 'Google Gemini 2.0 Flash model',
        isDefault: true
    },
    {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: AIProvider.OpenAI,
        description: 'An expensive OpenAI model'
    },
    {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: AIProvider.OpenAI,
        description: 'Faster and more cost-effective model'
    }
];

export function getDefaultModel(): ModelConfig {
    return availableModels[0];
}

// Helper functions for model configuration
export function getModelById(modelId: string): ModelConfig | undefined {
    return availableModels.find(m => m.id === modelId);
}