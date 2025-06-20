"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { shikiToMonaco } from "@shikijs/monaco";
import type { Monaco } from "@monaco-editor/react";
import { highlighter } from "@/lib/config/themes";
import { Terminal } from "@/components/terminal/Terminal";
import { ResetModal } from "@/components/editor/ResetModal";
import { useEditorStore } from "@/lib/stores/editorStore";
import type { editor as MonacoEditor } from "monaco-editor";

import {
  Code2,
  Play,
  RefreshCw,
  FileText,
  Undo2,
  Redo2,
  Loader2,
  CheckCircle,
} from "lucide-react";

// Dynamically import Monaco Editor with SSR disabled
const Editor = dynamic(
  async () => {
    await import("vscode");
    const monaco = await import("monaco-editor");
    const { loader } = await import("@monaco-editor/react");
    loader.config({ monaco });
    self.MonacoEnvironment = {
      getWorker(_, label) {
        if (label === "typescript") {
          return new Worker(
            new URL(
              "monaco-editor/esm/vs/language/typescript/ts.worker.js",
              import.meta.url
            )
          );
        }
        return new Worker(
          new URL(
            "monaco-editor/esm/vs/editor/editor.worker.js",
            import.meta.url
          )
        );
      },
    };
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
  glyphMargin: true,
  automaticLayout: true,
  fontFamily: "'JetBrains Mono', 'var(--font-jetbrains-mono)', monospace",
  fontLigatures: true,
  fontWeight: "600",
};

export function JavaEditor() {
  const [hydrated, setHydrated] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const {
    code,
    setEditorInstance,
    isExecuting,
    terminalOutput,
    disconnectLsp,
    selectedTheme,
    formatCode,
    undo,
    redo,
    runTests,
    isRunningTests,
  } = useEditorStore();

  const lang = "java";
  const path = "/app/workspace/hello.java";

  // a ref to hold our DecorationsCollection
  const decorationsRef = useRef<ReturnType<
    MonacoEditor.IStandaloneCodeEditor["createDecorationsCollection"]
  > | null>(null);

  const handleEditorWillMount = useCallback((monaco: Monaco) => {
    shikiToMonaco(highlighter, monaco);
  }, []);

  useEffect(() => {
    setHydrated(true);
    return () => {
      disconnectLsp();
    };
  }, [disconnectLsp]);

  const handleEditorMount = useCallback(
    (ed: MonacoEditor.IStandaloneCodeEditor) => {
      setEditorInstance(ed);
      decorationsRef.current = ed.createDecorationsCollection();
    },
    [setEditorInstance]
  );

  const handleResetClick = () => {
    setIsResetModalOpen(true);
  };

  const closeResetModal = () => {
    setIsResetModalOpen(false);
  };

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
        <div className="flex items-center">
          <Code2 className="w-5 h-5 mr-2" />
          <span>Java Editor</span>
        </div>

        <div className="flex items-center">
          <div className="flex mr-3 border-r border-gray-700 pr-3">
            <button
              onClick={undo}
              className="w-8 h-8 flex items-center justify-center rounded text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              className="w-8 h-8 flex items-center justify-center rounded text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              title="Redo (Ctrl+Y)"
              aria-label="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={formatCode}
            className="w-8 h-8 flex items-center justify-center mr-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Format Code (Alt+Shift+F)"
            aria-label="Format Code"
          >
            <FileText className="w-4 h-4" />
          </button>{" "}
          <div className="flex space-x-2">
            <button
              onClick={handleResetClick}
              className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 rounded flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
              title="Reset to original problem code"
              aria-label="Reset Code"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              <span className="text-sm">Reset</span>
            </button>

            <button
              onClick={runTests}
              disabled={isExecuting}
              className={`bg-green-600 hover:bg-green-700 text-white h-8 px-4 rounded flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 ${
                isExecuting ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
              }`}
              title="Run Code"
              aria-label={isExecuting ? "Running code..." : "Run Code"}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="text-sm">Running</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" fill="currentColor" />
                  <span className="text-sm">Run</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <Editor
          className="h-full font-jetbrains-mono"
          language="java"
          theme={selectedTheme.id}
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
      <ResetModal isOpen={isResetModalOpen} onClose={closeResetModal} />
    </div>
  );
}
