"use client";

import { JavaEditor } from "@/components/editor/Editor";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useEditorStore } from "@/lib/stores/editorStore";
import { MarkdownPanel } from "@/components/problem/MarkdownPanel";
import { Settings, Info, Brain } from "lucide-react";

export default function Home() {
  const { setSettingsOpen } = useEditorStore();

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Brain className="w-5 h-5 text-gray-300" />
          <h1 className="text-xl font-jetbrains-mono font-semibold text-white ml-2">
            Code Tutor
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex cursor-pointer items-center text-gray-300 hover:text-white transition-colors"
            title="Open settings"
          >
            <Settings className="w-5 h-5" />
            <span className="ml-1">Settings</span>
          </button>
          <div className="text-gray-400">|</div>
          <a
            href="https://github.com/LucasWolke/code-tutor/wiki/Tutor-Meeting"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-gray-300 hover:text-white transition-colors"
            title="View instructions"
          >
            <Info className="w-5 h-5" />
            <span className="ml-1">Instructions</span>
          </a>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col md:flex-row">
        <div className="flex-shrink-0 md:w-1/5 lg:w-1/6 xl:w-1/5 h-full overflow-hidden border-r border-gray-700 min-h-[200px] md:min-h-0">
          <MarkdownPanel />
        </div>

        <div className="flex-grow flex-shrink basis-0 min-w-0 h-full overflow-hidden order-first md:order-none">
          <JavaEditor />
        </div>

        <div className="flex-shrink-0 md:w-1/5 lg:w-1/4 xl:w-1/5 h-full overflow-hidden border-l border-gray-700 min-h-[200px] md:min-h-0">
          <ChatInterface />
        </div>
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 px-6 py-2 text-xs text-gray-400">
        <div className="flex justify-between items-center">
          <div>Java Web IDE with AI Tutor</div>
          <div>Built with Next.js, Monaco Editor (Typefox) & Love ❤️</div>
        </div>
      </footer>

      <SettingsModal />
    </div>
  );
}
