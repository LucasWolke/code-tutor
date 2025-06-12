import { create } from 'zustand';
import { AIMessage, HumanMessage } from "@langchain/core/messages"; // Assuming standard Langchain import
import { EnhancedChatMessage, HelpLevel, ModelConfig } from '@/types/chat';
import { availableModels, getDefaultModel } from '@/lib/config/models';
import { getModelById } from '@/lib/config/models';
import { generateResponse } from '@/lib/services/aiService';

interface ChatState {
    // Model selection
    selectedModelId: string;
    setSelectedModelId: (modelId: string) => void;
    getSelectedModelId: () => string;
    getAvailableModels: () => ModelConfig[];
    getSelectedModel: () => ModelConfig;
    // Chat messages
    messages: EnhancedChatMessage[];
    addMessage: (message: EnhancedChatMessage) => void;
    clearMessages: () => void;

    // Input state
    input: string;
    setInput: (input: string) => void;

    // Loading state
    isLoading: boolean;

    // Help level selection
    selectedHelpLevel: HelpLevel | undefined;
    setSelectedHelpLevel: (level: HelpLevel | undefined) => void;

    // Message handling
    sendMessage: (message: string) => Promise<void>;
    sendErrorMessage: () => Promise<void>;
}


export const useChatStore = create<ChatState>((set, get) => ({
    // Model selection
    selectedModelId: getDefaultModel().id, // Initialize with default model
    setSelectedModelId: (modelId) => {
        const model = getModelById(modelId);
        if (!model) {
            console.warn(`Model '${modelId}' is not available, using default model`);
            set({ selectedModelId: getDefaultModel().id });
        } else {
            set({ selectedModelId: modelId });
        }
    },
    getSelectedModelId: () => get().selectedModelId,
    getAvailableModels: () => availableModels,
    getSelectedModel: () => {
        const model = getModelById(get().selectedModelId);
        return model || getDefaultModel();
    },

    // Initialize with a welcome message
    messages: [new AIMessage({ content: "Hello! I'm your Java coding tutor. How can I help you?" }) as EnhancedChatMessage],
    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),
    clearMessages: () => set({
        messages: [new AIMessage({ content: "Hello! I'm your Java coding tutor. How can I help you?" }) as EnhancedChatMessage]
    }),

    // Input handling
    input: "",
    setInput: (input) => set({ input }),

    // Loading state
    isLoading: false,

    // Help level
    selectedHelpLevel: undefined,
    setSelectedHelpLevel: (level) => set({ selectedHelpLevel: level }),

    // Message handling
    sendErrorMessage: async () => {
        const content = "Help me fix this error in my code. I dont need any other advice for this next message, just how to solve this error. ";

        // Add user message for the error request
        const userErrorMessage = new HumanMessage({ content }) as EnhancedChatMessage;
        get().addMessage(userErrorMessage);

        // Add loading placeholder message
        const loadingMessage = new AIMessage({ content: "Thinking..." }) as EnhancedChatMessage;
        loadingMessage.isLoading = true;
        get().addMessage(loadingMessage);
        set({ isLoading: true });

        try {
            // Get current chat history including the new user error message
            const chatHistory = get().messages.filter(msg => msg !== loadingMessage); // Exclude loading message itself from history

            // Generate AI response
            const response = await generateResponse(chatHistory, { // Use aiService instance
                helpLevel: HelpLevel.Contextual,
            });

            // Replace loading message with actual response
            set((state) => {
                const messagesWithoutLoading = state.messages.filter(
                    (msg) => !msg.isLoading
                );
                const newMessage = new AIMessage({ content: response.text }) as EnhancedChatMessage;
                newMessage.helpLevel = response.helpLevel;
                return {
                    messages: [
                        ...messagesWithoutLoading,
                        newMessage,
                    ],
                    isLoading: false,
                };
            });
        } catch (error) {
            // Handle errors
            const errorMessage = new AIMessage({ content: "Sorry, I encountered an error. Please try again." }) as EnhancedChatMessage;
            set((state) => ({
                messages: [...state.messages.filter(msg => !msg.isLoading), errorMessage],
                isLoading: false,
            }));
            console.error("AI chat error in sendErrorMessage:", error);
        }
    },

    // Message handling
    sendMessage: async (content) => {
        const { selectedHelpLevel } = get();

        // Don't send if already loading or content is empty
        if (get().isLoading || !content.trim()) {
            return;
        }
        // Set loading state
        set({ isLoading: true });

        // Add user message
        const userMessage = new HumanMessage({ content }) as EnhancedChatMessage;
        get().addMessage(userMessage);

        // Clear input field
        set({ input: "" });

        // Add loading placeholder message
        const loadingMessage = new AIMessage({ content: "Thinking..." }) as EnhancedChatMessage;
        loadingMessage.isLoading = true;
        get().addMessage(loadingMessage);

        try {
            // Compose chat history
            // The chatHistory should be all messages up to the point before the AI responds, including the current userMessage
            const chatHistory = get().messages.filter(msg => msg !== loadingMessage); // Exclude loading message itself

            const response = await generateResponse( // Use aiService instance
                chatHistory,
                { helpLevel: selectedHelpLevel }
            );

            // Replace loading message with actual response
            set((state) => {
                const messagesWithoutLoading = state.messages.filter(
                    (msg) => !msg.isLoading
                );
                const newMessage = new AIMessage({ content: response.text }) as EnhancedChatMessage;
                newMessage.helpLevel = response.helpLevel;
                return {
                    messages: [
                        ...messagesWithoutLoading,
                        newMessage,
                    ],
                    isLoading: false,
                };
            });
        } catch (error) {
            // Handle errors
            const errorMessage = new AIMessage({ content: "Sorry, I encountered an error. Please try again." + error }) as EnhancedChatMessage;
            set((state) => ({
                messages: [...state.messages.filter(msg => !msg.isLoading), errorMessage],
                isLoading: false,
            }));
            console.error("AI chat error in sendMessage:", error);
        }
    },
}));