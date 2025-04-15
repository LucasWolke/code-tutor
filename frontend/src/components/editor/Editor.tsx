"use client";

import dynamic from "next/dynamic";
import * as vscode from "vscode";
import { useCallback, useEffect, useState } from "react";
import { shikiToMonaco } from "@shikijs/monaco";
import type { Monaco } from "@monaco-editor/react";
import { highlighter } from "@/lib/shiki";
import { Terminal } from "@/components/terminal/Terminal";
import { useEditorStore } from "@/lib/stores/editorStore";
import { editor } from "monaco-editor";

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
  // Client-side hydration check
  const [hydrated, setHydrated] = useState(false);

  // Get everything from the store
  const {
    code,
    setEditorInstance,
    executeCode,
    isExecuting,
    terminalOutput,
    disconnectLsp,
  } = useEditorStore();

  // Java configuration
  const lang = "java";
  const path = vscode.Uri.file(`app/workspace/hello.java`);

  const handleEditorWillMount = useCallback((monaco: Monaco) => {
    shikiToMonaco(highlighter, monaco);
  }, []);

  // Mark as hydrated when component mounts
  useEffect(() => {
    setHydrated(true);

    // Cleanup LSP connection on unmount
    return () => {
      disconnectLsp();
    };
  }, [disconnectLsp]);

  // Editor mount handler - store the instance
  const handleEditorMount = useCallback(
    (editorInstance: editor.IStandaloneCodeEditor) => {
      setEditorInstance(editorInstance);
    },
    [setEditorInstance]
  );

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center font-jetbrains-mono justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
        <span className="mr-2">Java Editor</span>
        <button
          onClick={executeCode}
          disabled={isExecuting}
          className={`bg-green-600 hover:bg-green-700 text-white py-1 px-4 rounded flex items-center transition-colors ${
            isExecuting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
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
          value={code}
          onMount={handleEditorMount}
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
