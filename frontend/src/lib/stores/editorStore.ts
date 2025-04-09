import { create } from 'zustand';
import { editor } from 'monaco-editor';
import * as monaco from 'monaco-editor';
import { MonacoLanguageClient } from 'monaco-languageclient';
import { initJavaLanguageServer } from '../services/languageServerService';
import { initializeVscodeApi } from '../services/monacoVscodeService';

export type EditorTheme = 'vs-dark' | 'vs-light' | 'hc-black' | 'hc-light';

interface EditorState {
    // Core state
    code: string;
    language: string;
    theme: EditorTheme;
    output: string;
    isRunning: boolean;

    // Monaco instances
    editorInstance: editor.IStandaloneCodeEditor | null;
    monacoInstance: typeof monaco | null;
    languageClient: MonacoLanguageClient | null;
    lspConnected: boolean;
    vscodeInitialized: boolean;

    // Actions
    setCode: (code: string) => void;
    setLanguage: (language: string) => void;
    setTheme: (theme: EditorTheme) => void;
    setOutput: (output: string) => void;
    setIsRunning: (isRunning: boolean) => void;
    setEditorInstance: (editorInstance: editor.IStandaloneCodeEditor | null) => void;
    setMonacoInstance: (instance: typeof monaco | null) => void;
    setLanguageClient: (client: MonacoLanguageClient | null) => void;
    setLspConnected: (connected: boolean) => void;
    setVscodeInitialized: (initialized: boolean) => void;
    initializeVscodeBridge: () => Promise<boolean>;
    connectToLanguageServer: () => Promise<void>;
    formatCode: () => void;
    runCode: () => Promise<void>;
    resetEditor: () => void;
}

const DEFAULT_JAVA_CODE = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java Web IDE!");
    }
}`;

export const useEditorStore = create<EditorState>((set, get) => ({
    // Initial state
    code: DEFAULT_JAVA_CODE,
    language: 'java',
    theme: 'vs-dark',
    output: '',
    isRunning: false,
    editorInstance: null,
    monacoInstance: null,
    languageClient: null,
    lspConnected: false,
    vscodeInitialized: false,

    // State setters
    setCode: (code) => set({ code }),
    setLanguage: (language) => set({ language }),
    setTheme: (theme) => set({ theme }),
    setOutput: (output) => set({ output }),
    setIsRunning: (isRunning) => set({ isRunning }),
    setEditorInstance: (editorInstance) => set({ editorInstance }),
    setMonacoInstance: (instance) => set({ monacoInstance: instance }),
    setLanguageClient: (client) => set({ languageClient: client }),
    setLspConnected: (connected) => set({ lspConnected: connected }),
    setVscodeInitialized: (initialized) => set({ vscodeInitialized: initialized }),

    // Initialize VSCode API bridge - must be called before creating editor
    initializeVscodeBridge: async () => {
        const { vscodeInitialized, setVscodeInitialized } = get();

        if (vscodeInitialized) {
            console.log('VSCode bridge already initialized');
            return true;
        }

        try {
            // Initialize the VSCode bridge which sets up necessary services
            const success = await initializeVscodeApi();
            if (success) {
                setVscodeInitialized(true);
                console.log('VSCode bridge initialized successfully');
            } else {
                console.error('VSCode bridge initialization returned false');
            }
            return success;
        } catch (error) {
            console.error('Failed to initialize VSCode bridge:', error);
            return false;
        }
    },

    // Connect to language server
    connectToLanguageServer: async () => {
        const { editorInstance, setLanguageClient, setLspConnected } = get();

        if (!editorInstance) {
            console.error('Editor instance not initialized');
            return;
        }

        try {
            // Initialize language server connection using WebSocket
            const client = await initJavaLanguageServer(editorInstance);

            // Set language client in store
            setLanguageClient(client);
            setLspConnected(true);
            console.log('Connected to Java language server');
        } catch (error) {
            console.error('Failed to connect to language server:', error);
            setLspConnected(false);
            throw error; // Rethrow so caller knows about failure
        }
    },

    // Format code using editor's formatting capabilities
    formatCode: () => {
        const { editorInstance } = get();
        if (editorInstance) {
            editorInstance.getAction('editor.action.formatDocument')?.run();
        }
    },

    // Run code (sends code to backend for execution)
    runCode: async () => {
        const { setIsRunning, setOutput, code } = get();

        setIsRunning(true);
        setOutput('Compiling and running code...');

        try {
            // Send code to backend for execution
            const response = await fetch('/api/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, language: 'java' }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setOutput(data.output || 'No output');
        } catch (error) {
            setOutput(`Error: Failed to run code\n${error instanceof Error ? error.message : String(error)}`);
            console.error('Run error:', error);
        } finally {
            setIsRunning(false);
        }
    },

    // Reset editor to default state
    resetEditor: () => set({
        code: DEFAULT_JAVA_CODE,
        output: ''
    })
}));