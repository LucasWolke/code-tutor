import { JavaEditor } from "@/components/editor/Editor";

export default function Home() {
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

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <JavaEditor />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 px-6 py-2 text-xs text-gray-400">
        <div className="flex justify-between items-center">
          <div>Java Web IDE with AI Tutor</div>
          <div>Built with Next.js, Monaco Editor (Typefox) & Love ❤️</div>
        </div>
      </footer>
    </div>
  );
}
