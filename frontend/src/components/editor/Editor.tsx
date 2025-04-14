"use client";

import dynamic from "next/dynamic";
import type { editor } from "monaco-editor";
import * as vscode from "vscode";
import { useCallback, useEffect, useRef, useState } from "react";
import { connectToLanguageServer } from "@/lib/language-server";
import type { MonacoLanguageClient } from "monaco-languageclient";
import { shikiToMonaco } from "@shikijs/monaco";
import type { Monaco } from "@monaco-editor/react";
import { highlighter } from "@/lib/shiki";
import { executeJavaCode } from "@/lib/services/codeExecutionService";
import { Terminal } from "@/components/terminal/Terminal";

// Dynamically import Monaco Editor with SSR disabled
const Editor = dynamic(
  async () => {
    await import("vscode");
    const monaco = await import("monaco-editor");
    const { loader } = await import("@monaco-editor/react");
    loader.config({ monaco });
    return (await import("@monaco-editor/react")).Editor;
  },
  {
    ssr: false,
    loading: () => <div>Loading</div>,
  }
);

// Default editor options
const DefaultEditorOptionConfig = {
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 14,
  tabSize: 2,
  automaticLayout: true,
  fontFamily: "'JetBrains Mono', 'var(--font-jetbrains-mono)', monospace",
  fontLigatures: true,
  fontWeight: "600",
};

export function JavaEditor() {
  // Local state
  const [hydrated, setHydrated] = useState(false);
  const [editorInstance, setEditorInstance] =
    useState<editor.IStandaloneCodeEditor | null>(null);
  const [markers, setMarkers] = useState<editor.IMarker[]>([]);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [value, setValue] = useState<string>(`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
}`);

  // Fixed Java configuration
  const lang = "java";
  const path = vscode.Uri.file(`app/workspace/hello.java`);

  const monacoLanguageClientRef = useRef<MonacoLanguageClient | null>(null);

  const handleEditorWillMount = useCallback((monaco: Monaco) => {
    shikiToMonaco(highlighter, monaco);
  }, []);

  // Set hydrated state on component mount
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Connect to LSP
  const connectLSP = useCallback(async () => {
    if (!editorInstance) return;

    // If there's an existing language client, stop it first
    if (monacoLanguageClientRef.current) {
      monacoLanguageClientRef.current.stop();
      monacoLanguageClientRef.current = null;
      setWebSocket(null);
    }

    // Create a new language client
    try {
      const { client: monacoLanguageClient, webSocket: ws } =
        await connectToLanguageServer();
      monacoLanguageClientRef.current = monacoLanguageClient;
      setWebSocket(ws);
    } catch (error) {
      console.error("Failed to connect to LSP:", error);
    }
  }, [editorInstance]);

  // Reconnect to the LSP whenever editor changes
  useEffect(() => {
    connectLSP();
  }, [connectLSP]);

  // Cleanup the LSP connection when the component unmounts
  useEffect(() => {
    return () => {
      if (monacoLanguageClientRef.current) {
        monacoLanguageClientRef.current.stop();
        monacoLanguageClientRef.current = null;
        setWebSocket(null);
      }
    };
  }, []);

  const handleOnMount = useCallback(
    async (editor: editor.IStandaloneCodeEditor) => {
      setEditorInstance(editor);

      // Update value whenever content changes
      editor.onDidChangeModelContent(() => {
        setValue(editor.getValue());
      });
    },
    []
  );

  // Handle code execution
  const handleExecuteCode = async () => {
    if (!editorInstance) return;

    try {
      setIsExecuting(true);
      setTerminalOutput("");

      const code = editorInstance.getValue();
      const result = await executeJavaCode(code);

      setTerminalOutput(result.output);
    } catch (error) {
      setTerminalOutput(
        `Error executing code: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsExecuting(false);
    }
  };

  if (!hydrated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center font-jetbrains-mono justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
        <span className="mr-2">Editor</span>
        <button
          onClick={handleExecuteCode}
          disabled={isExecuting}
          className={`bg-green-600 hover:bg-green-700 text-white py-1 px-4 rounded flex items-center transition-colors ${
            isExecuting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isExecuting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Running...
            </>
          ) : (
            <>Run</>
          )}
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          className="h-full font-jetbrains-mono"
          language={lang}
          theme="houston"
          path={path.toString()}
          value={value}
          onMount={handleOnMount}
          options={DefaultEditorOptionConfig}
          beforeMount={handleEditorWillMount}
          loading={<div>Loading...</div>}
        />
      </div>
      <div className="h-64 min-h-64">
        <Terminal output={terminalOutput} isLoading={isExecuting} />
      </div>
    </div>
  );
}
