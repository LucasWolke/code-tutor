import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '@/lib/services/ai/types';
import { HelpLevel } from '@/lib/langchain/types';
import { aiService, generateResponse } from '@/lib/services/ai/aiService';
import { useEditorStore } from './editorStore';

// Enhanced chat message with help level
export interface EnhancedChatMessage extends ChatMessage {
    helpLevel?: HelpLevel;
    isLoading?: boolean;
}

// Help level name mappings
export const helpLevelNames = {
    [HelpLevel.Motivational]: "Motivational",
    [HelpLevel.Feedback]: "Feedback",
    [HelpLevel.GeneralStrategy]: "General Strategy",
    [HelpLevel.ContentStrategy]: "Content Strategy",
    [HelpLevel.Contextual]: "Contextual",
};

// Help level color mappings
export const helpLevelColors = {
    [HelpLevel.Motivational]: "bg-purple-600",
    [HelpLevel.Feedback]: "bg-blue-600",
    [HelpLevel.GeneralStrategy]: "bg-green-600",
    [HelpLevel.ContentStrategy]: "bg-yellow-600",
    [HelpLevel.Contextual]: "bg-red-600",
};

interface ChatState {
    // Chat messages
    messages: EnhancedChatMessage[];
    addMessage: (message: EnhancedChatMessage) => void;
    clearMessages: () => void;

    // Input state
    input: string;
    setInput: (input: string) => void;

    // Loading state
    isLoading: boolean;

    // Session management
    sessionId: string;
    userId: string;

    // Help level selection
    selectedHelpLevel: HelpLevel | undefined;
    setSelectedHelpLevel: (level: HelpLevel | undefined) => void;

    // Message handling
    sendMessage: (message: string) => Promise<void>;
    sendErrorMessage: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
    // Initialize with a welcome message
    messages: [
        {
            role: "assistant",
            content: "Hello! I'm your Java coding tutor. How can I help you?",
        },
    ],
    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),
    clearMessages: () => set({
        messages: [
            {
                role: "assistant",
                content: "Hello! I'm your Java coding tutor. How can I help you?",
            },
        ]
    }),

    // Input handling
    input: "",
    setInput: (input) => set({ input }),

    // Loading state
    isLoading: false,

    // Session management
    sessionId: uuidv4(),
    userId: `user-${uuidv4().substring(0, 8)}`,

    // Help level
    selectedHelpLevel: undefined,
    setSelectedHelpLevel: (level) => set({ selectedHelpLevel: level }),

    // Message handling
    sendErrorMessage: async () => {

        const content = "Help me fix this error in my code. I dont need any other advice for this next message, just how to solve this error. ";

        // Add loading placeholder message
        const loadingMessage: EnhancedChatMessage = {
            role: "assistant",
            content: "Thinking...",
            isLoading: true,
        };
        get().addMessage(loadingMessage);

        try {
            // Ensure aiService has the correct session and user IDs
            aiService.setSessionId(get().sessionId);
            aiService.setUserId(get().userId);

            // Get current code from editor store
            const code = useEditorStore.getState().code;
            const terminalOutput = useEditorStore.getState().terminalOutput;

            // Generate AI response
            const response = await generateResponse(content, code, terminalOutput, {
                helpLevel: HelpLevel.Contextual,
            });

            // Replace loading message with actual response
            set((state) => {
                const messagesWithoutLoading = state.messages.filter(
                    (msg) => !msg.isLoading
                );
                return {
                    messages: [
                        ...messagesWithoutLoading,
                        {
                            role: "assistant",
                            content: response.text,
                            helpLevel: response.helpLevel,
                        },
                    ],
                    isLoading: false,
                };
            });
        } catch (error) {
            // Handle errors
            set((state) => {
                const messagesWithoutLoading = state.messages.filter(
                    (msg) => !msg.isLoading
                );
                return {
                    messages: [
                        ...messagesWithoutLoading,
                        {
                            role: "assistant",
                            content: "Sorry, I encountered an error. Please try again later.",
                        },
                    ],
                    isLoading: false,
                };
            });
            console.error("AI chat error:", error);
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
        const userMessage: EnhancedChatMessage = {
            role: "user",
            content,
        };
        get().addMessage(userMessage);

        // Clear input field
        set({ input: "" });

        // Add loading placeholder message
        const loadingMessage: EnhancedChatMessage = {
            role: "assistant",
            content: "Thinking...",
            isLoading: true,
        };
        get().addMessage(loadingMessage);

        try {
            // Ensure aiService has the correct session and user IDs
            aiService.setSessionId(get().sessionId);
            aiService.setUserId(get().userId);

            // Get current code from editor store
            const code = useEditorStore.getState().code;
            const terminalOutput = useEditorStore.getState().terminalOutput;

            // Generate AI response
            const response = await generateResponse(content, code, terminalOutput, {
                helpLevel: selectedHelpLevel,
            });

            // Replace loading message with actual response
            set((state) => {
                const messagesWithoutLoading = state.messages.filter(
                    (msg) => !msg.isLoading
                );
                return {
                    messages: [
                        ...messagesWithoutLoading,
                        {
                            role: "assistant",
                            content: response.text,
                            helpLevel: response.helpLevel,
                        },
                    ],
                    isLoading: false,
                };
            });
        } catch (error) {
            // Handle errors
            set((state) => {
                const messagesWithoutLoading = state.messages.filter(
                    (msg) => !msg.isLoading
                );
                return {
                    messages: [
                        ...messagesWithoutLoading,
                        {
                            role: "assistant",
                            content: "Sorry, I encountered an error. Please try again later.",
                        },
                    ],
                    isLoading: false,
                };
            });
            console.error("AI chat error:", error);
        }
    },
}));



// Initialize session on the server side
if (typeof window !== 'undefined') {
    const { sessionId, userId } = useChatStore.getState();
    aiService.setSessionId(sessionId);
    aiService.setUserId(userId);
}