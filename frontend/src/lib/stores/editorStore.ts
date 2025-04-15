import { create } from 'zustand';
import type { editor } from 'monaco-editor';
import { executeJavaCode } from '@/lib/services/codeExecutionService';
import { connectToLanguageServer, disconnectLanguageServer } from '@/lib/services/languageServerService';
import type { MonacoLanguageClient } from 'monaco-languageclient';

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
}

// Initial Java code template
const DEFAULT_JAVA_CODE = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World!");
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
            const errorMessage = `Error executing code: ${error instanceof Error ? error.message : String(error)
                }`;
            set({ terminalOutput: errorMessage });
        } finally {
            set({ isExecuting: false });
        }
    }
}));