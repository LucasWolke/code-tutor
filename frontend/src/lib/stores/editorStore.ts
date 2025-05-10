import { create } from 'zustand';
import type { editor } from 'monaco-editor';
import { executeJavaCode } from '@/lib/services/codeExecutionService';
import { connectToLanguageServer, disconnectLanguageServer } from '@/lib/services/languageServerService';
import type { MonacoLanguageClient } from 'monaco-languageclient';
import { aiService } from '@/lib/services/ai/aiService';
import { ModelConfig } from '@/lib/config/models';
import { EditorTheme, editorThemes } from '@/lib/config/themes';

interface EditorState {
    // Editor content
    code: string;
    setCode: (code: string) => void;

    // Editor instance
    editorInstance: editor.IStandaloneCodeEditor | null;
    setEditorInstance: (instance: editor.IStandaloneCodeEditor | null) => void;

    // LSP connection
    languageClient: MonacoLanguageClient | null;
    isLspConnected: boolean;
    connectLsp: () => Promise<void>;
    disconnectLsp: () => void;

    // Code execution
    isExecuting: boolean;
    terminalOutput: string;
    executeCode: () => Promise<void>;

    // AI model preferences
    selectedModelId: string;
    availableModels: ModelConfig[];
    setSelectedModel: (modelId: string) => void;
    getSelectedModel: () => ModelConfig;

    // Editor theme
    selectedTheme: EditorTheme;
    availableThemes: EditorTheme[];
    setSelectedTheme: (themeId: string) => void;

    // Settings modal
    isSettingsOpen: boolean;
    setSettingsOpen: (isOpen: boolean) => void;
}

// Initial Java code template
const DEFAULT_JAVA_CODE = `public class Main {
    public static void main(String[] args) {
        // Task: Print the numbers from 1 to 100.
        // For multiples of 3, print "Fizz" instead of the number.
        // For multiples of 5, print "Buzz".
        // For numbers that are multiples of both 3 and 5, print "FizzBuzz".

        for (int i = 1; i <= 100; i++) {
            if (i % 3 == 0) {
                System.out.println("Fizz");
            } else if (i % 5 == 0) {
                System.out.println("Buzz");
            } else {
                System.out.println(i);
            }
        }
    }
}`;

export const useEditorStore = create<EditorState>((set, get) => ({
    // Editor content
    code: DEFAULT_JAVA_CODE,
    setCode: (code: string) => set({ code }),

    // Editor instance
    editorInstance: null,
    setEditorInstance: (instance) => {
        set({ editorInstance: instance });

        // Setup content change listener
        if (instance) {
            instance.onDidChangeModelContent(() => {
                const newCode = instance.getValue();
                set({ code: newCode });
            });

            // Connect to LSP when editor is ready
            get().connectLsp();
        }
    },

    // LSP connection
    languageClient: null,
    isLspConnected: false,
    connectLsp: async () => {
        const { editorInstance } = get();
        if (!editorInstance) return;

        // First disconnect any existing connection
        get().disconnectLsp();

        try {
            const { client } = await connectToLanguageServer();
            set({
                languageClient: client,
                isLspConnected: true
            });
        } catch (error) {
            console.error("Failed to connect to LSP:", error);
            set({ isLspConnected: false });
        }
    },
    disconnectLsp: () => {
        const { languageClient } = get();
        if (languageClient) {
            disconnectLanguageServer(languageClient);
            set({
                languageClient: null,
                isLspConnected: false
            });
        }
    },

    // Code execution
    isExecuting: false,
    terminalOutput: "",
    executeCode: async () => {
        const { editorInstance } = get();
        if (!editorInstance) return;

        set({
            isExecuting: true,
            terminalOutput: ""
        });

        try {
            const currentCode = editorInstance.getValue();
            const result = await executeJavaCode(currentCode);
            set({ terminalOutput: result.output });
        } catch (error) {
            const errorMessage = `Error executing code: ${error instanceof Error ? error.message : String(error)}`;
            set({ terminalOutput: errorMessage });
        } finally {
            set({ isExecuting: false });
        }
    },

    // AI model preferences
    selectedModelId: aiService.getSelectedModelId(),
    availableModels: aiService.getAvailableModels(),
    setSelectedModel: (modelId: string) => {
        aiService.setModel(modelId);
        set({ selectedModelId: modelId });
    },
    getSelectedModel: () => {
        return aiService.getSelectedModel();
    },

    // Editor theme
    selectedTheme: editorThemes.find(t => t.isDefault) || editorThemes[0],
    availableThemes: editorThemes,
    setSelectedTheme: (themeId: string) => {
        const theme = editorThemes.find(t => t.id === themeId);
        set({ selectedTheme: theme || editorThemes[0] });
    },

    // Settings modal
    isSettingsOpen: false,
    setSettingsOpen: (isOpen: boolean) => set({ isSettingsOpen: isOpen }),
}));