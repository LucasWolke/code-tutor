"use client";

import { JavaEditor } from "@/components/editor/Editor";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useEditorStore } from "@/lib/stores/editorStore";

export default function Home() {
  const { setSettingsOpen } = useEditorStore();

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-jetbrains-mono font-semibold text-white">
            Code Tutor 🧠
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center text-gray-300 hover:text-white transition-colors"
            title="Open settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span className="ml-1">Settings</span>
          </button>
          <a
            href="https://github.com/LucasWolke/code-tutor"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white transition-colors text-sm"
          >
            Source Code
          </a>
        </div>
      </header>

      {/* Main content - Split view with Editor and Chat */}
      <main className="flex-1 overflow-hidden flex">
        {/* Editor section - 70% width */}
        <div className="w-[70%] h-full overflow-hidden">
          <JavaEditor />
        </div>

        {/* Chat interface - 30% width */}
        <div className="w-[30%] h-full overflow-hidden">
          <ChatInterface />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 px-6 py-2 text-xs text-gray-400">
        <div className="flex justify-between items-center">
          <div>Java Web IDE with AI Tutor</div>
          <div>Built with Next.js, Monaco Editor (Typefox) & Love ❤️</div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal />
    </div>
  );
}
