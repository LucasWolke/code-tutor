"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { useProblemStore } from "@/lib/stores/problemStore";
import { getAllProblems, getProblemById } from "@/lib/config/problems";
import { useEditorStore } from "@/lib/stores/editorStore";
import { FileCode2 } from "lucide-react";

export function MarkdownPanel() {
  const { problem, setProblem } = useProblemStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { loadProblemBoilerplate } = useEditorStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const problems = getAllProblems();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Helper function to get background color based on difficulty
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy":
        return "bg-green-700";
      case "medium":
        return "bg-yellow-600";
      case "hard":
        return "bg-red-700";
      default:
        return "bg-green-700";
    }
  };

  const handleProblemSelect = useCallback(
    (problemId: string) => {
      const selectedProblem = getProblemById(problemId);
      if (selectedProblem) {
        setProblem(selectedProblem);
        // Use setTimeout to ensure the state update completes before loading the code
        setTimeout(() => {
          loadProblemBoilerplate();
        }, 0);
      }
      setIsDropdownOpen(false);
    },
    [setProblem, loadProblemBoilerplate]
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center font-jetbrains-mono justify-between bg-gray-800 px-4 py-3 border-b border-gray-700">
        <div className="flex items-center relative">
          <FileCode2 className="w-5 h-5 mr-2" />
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center text-white hover:text-blue-300 cursor-pointer transition duration-150"
          >
            <h2 className="font-medium font-jetbrains-mono mr-1">
              {problem.title || "Problem"}
            </h2>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transform ${
                isDropdownOpen ? "rotate-180" : ""
              } transition-transform duration-200`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          <span
            className={`ml-2 px-2 py-1 text-xs rounded text-white ${getDifficultyColor(
              problem.difficulty
            )}`}
          >
            {problem.difficulty.charAt(0).toUpperCase() +
              problem.difficulty.slice(1)}
          </span>
          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 mt-1 w-64 bg-gray-800 border border-gray-700 rounded shadow-lg z-10"
            >
              <div className="py-2 max-h-64 overflow-y-auto">
                <div className="px-3 py-1 text-xs text-green-500 font-semibold">
                  Easy
                </div>
                {problems
                  .filter((p) => p.difficulty === "easy")
                  .map((problem) => (
                    <button
                      key={problem.id}
                      onClick={() => handleProblemSelect(problem.id)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                    >
                      {problem.title}
                    </button>
                  ))}

                <div className="px-3 py-1 text-xs text-yellow-500 font-semibold mt-1">
                  Medium
                </div>
                {problems
                  .filter((p) => p.difficulty === "medium")
                  .map((problem) => (
                    <button
                      key={problem.id}
                      onClick={() => handleProblemSelect(problem.id)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                    >
                      {problem.title}
                    </button>
                  ))}

                <div className="px-3 py-1 text-xs text-red-500 font-semibold mt-1">
                  Hard
                </div>
                {problems
                  .filter((p) => p.difficulty === "hard")
                  .map((problem) => (
                    <button
                      key={problem.id}
                      onClick={() => handleProblemSelect(problem.id)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                    >
                      {problem.title}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>{" "}
      <div className="flex-1 overflow-y-auto p-4">
        <article className="prose prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {problem.content || "No problem selected."}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
