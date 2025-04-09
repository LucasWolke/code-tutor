import React, { useEffect, useRef } from "react";
import Editor, { Monaco, OnMount } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { debounce } from "@/lib/utils";
import { useEditorStore } from "@/lib/stores/editorStore";
import { configureJavaLanguage } from "@/lib/services/monacoVscodeService";
import { ProblemEditor } from "../problem-editor";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  theme?: string;
  height?: string;
  readOnly?: boolean;
  options?: editor.IStandaloneEditorConstructionOptions;
}

/**
 * Monaco-based code editor component with VSCode API integration
 * and Java language server support
 */
const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = "java",
  theme = "vs-dark",
  height = "80vh",
  readOnly = false,
  options = {},
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const {
    setEditorInstance,
    setMonacoInstance,
    initializeVscodeBridge,
    connectToLanguageServer,
    vscodeInitialized,
    lspConnected,
  } = useEditorStore();

  // Debounce code changes to prevent excessive state updates
  const debouncedChange = debounce((value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  }, 300);

  // Initialize VSCode API only once when component mounts
  useEffect(() => {
    const initVscodeBridge = async () => {
      try {
        // This will initialize all the monaco-vscode-api services
        // and must be done before creating any editor instances
        await initializeVscodeBridge();
      } catch (error) {
        console.error("VSCode bridge initialization error:", error);
      }
    };

    if (!vscodeInitialized) {
      initVscodeBridge();
    }
  }, [initializeVscodeBridge, vscodeInitialized]);

  // Handle editor mounting
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    setEditorInstance(editor);
    setMonacoInstance(monaco);

    // Set up a model with a specific URI for LSP to work with
    const uri = monaco.Uri.parse(`file:///workspace/Main.${language}`);

    // Dispose existing model with the same URI if exists
    const existingModel = monaco.editor.getModel(uri);
    if (existingModel) {
      existingModel.dispose();
    }

    // Create new model with the URI
    const model = monaco.editor.createModel(value, language, uri);
    editor.setModel(model);

    // Listen for editor content changes
    model.onDidChangeContent(() => {
      const value = model.getValue();
      debouncedChange(value);
    });

    // Focus the editor after mounting
    editor.focus();

    // If VSCode bridge is initialized but not connected to LSP yet, connect now
    if (vscodeInitialized && !lspConnected) {
      connectToLanguageServer()
        .then(() => console.log("Language server connected successfully"))
        .catch((err) =>
          console.error("Language server connection failed:", err)
        );
    }
  };

  return (
    <div className="border rounded-md overflow-hidden relative">
      <ProblemEditor />
      {/* LSP connection status indicator */}
      {vscodeInitialized && (
        <div
          className={`absolute bottom-2 right-2 px-2 py-1 text-xs rounded ${
            lspConnected
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          LSP: {lspConnected ? "Connected" : "Disconnected"}
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
