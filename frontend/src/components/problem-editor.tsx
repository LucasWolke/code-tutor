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
  fontWeight: "600", // Making the font bolder/thicker
};

export function ProblemEditor() {
  // Local state instead of useProblem
  const [hydrated, setHydrated] = useState(false);
  const [editorInstance, setEditorInstance] =
    useState<editor.IStandaloneCodeEditor | null>(null);
  const [markers, setMarkers] = useState<editor.IMarker[]>([]);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [value, setValue] =
    useState<string>(`public static void main (String[] args) {
    System.out.println("Hello World!");
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
    },
    []
  );

  if (!hydrated) {
    return <div>Loading...</div>;
  }

  return (
    <Editor
      className="font-jetbrains-mono"
      language={lang}
      theme="houston"
      path={path.toString()}
      value={value}
      onMount={handleOnMount}
      options={DefaultEditorOptionConfig}
      beforeMount={handleEditorWillMount}
      loading={<div>Loading...</div>}
    />
  );
}
