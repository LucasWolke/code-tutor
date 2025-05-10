
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