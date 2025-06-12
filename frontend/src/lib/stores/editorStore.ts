import { create } from 'zustand';
import type { editor } from 'monaco-editor';
import { executeJavaCode, runTestCases } from '@/lib/services/codeExecutionService';
import { connectToLanguageServer, disconnectLanguageServer } from '@/lib/services/languageServerService';
import type { MonacoLanguageClient } from 'monaco-languageclient';
import { EditorTheme, editorThemes } from '@/lib/config/themes';
import { useProblemStore } from './problemStore';
import { TestRunResult } from '@/types/code';

interface EditorState {
    // Editor content
    code: string;
    setCode: (code: string) => void;

    // Editor instance
    editorInstance: editor.IStandaloneCodeEditor | null;
    setEditorInstance: (instance: editor.IStandaloneCodeEditor | null) => void;

    // Editor actions
    formatCode: () => void;
    undo: () => void;
    redo: () => void;

    // LSP connection
    languageClient: MonacoLanguageClient | null;
    isLspConnected: boolean;
    connectLsp: () => Promise<void>;
    disconnectLsp: () => void;

    // Code execution
    isExecuting: boolean;
    terminalOutput: string;
    executeCode: () => Promise<void>;

    // Test execution
    isRunningTests: boolean;
    testResults: TestRunResult | null;
    runTests: () => Promise<void>;

    // Editor theme
    selectedTheme: EditorTheme;
    availableThemes: EditorTheme[];
    setSelectedTheme: (themeId: string) => void;

    // Settings modal
    isSettingsOpen: boolean;
    setSettingsOpen: (isOpen: boolean) => void;

    // Problem integration
    loadProblemBoilerplate: () => void;
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

            // Load current problem's boilerplate if available
            get().loadProblemBoilerplate();
        }
    },

    // Editor actions
    formatCode: () => {
        const { editorInstance } = get();
        editorInstance?.getAction('editor.action.formatDocument')?.run();
    },
    undo: () => {
        const { editorInstance } = get();
        editorInstance?.trigger('keyboard', 'undo', null);
    },
    redo: () => {
        const { editorInstance } = get();
        editorInstance?.trigger('keyboard', 'redo', null);
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
    },    // Code execution
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

    // Test execution
    isRunningTests: false,
    testResults: null, runTests: async () => {
        const { editorInstance } = get();
        if (!editorInstance) return;

        const { testCases, methodSignature } = useProblemStore.getState();
        if (!testCases || testCases.length === 0) {
            set({
                terminalOutput: "No test cases available for this problem.",
                testResults: null
            });
            return;
        }

        if (!methodSignature) {
            set({
                terminalOutput: "No method signature available for this problem.",
                testResults: null
            });
            return;
        }

        set({
            isRunningTests: true,
            isExecuting: true,
            terminalOutput: "Running tests...",
            testResults: null
        });

        try {
            const currentCode = editorInstance.getValue();
            const result = await runTestCases(currentCode, methodSignature, testCases);

            // Format test results for terminal output
            let output = `Test Results: ${result.allPassed ? "All tests passed!" : "Some tests failed."}\n\n`;
            set({
                terminalOutput: output,
                testResults: result
            });
        } catch (error) {
            const errorMessage = `Error running tests: ${error instanceof Error ? error.message : String(error)}`;
            set({
                terminalOutput: errorMessage,
                testResults: null
            });
        } finally {
            set({
                isRunningTests: false,
                isExecuting: false
            });
        }
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

    // Problem integration
    loadProblemBoilerplate: () => {
        const { editorInstance } = get();
        const { boilerplateCode } = useProblemStore.getState();

        if (editorInstance && boilerplateCode) {
            editorInstance.setValue(boilerplateCode);
            set({ code: boilerplateCode });
        }
    }
}));