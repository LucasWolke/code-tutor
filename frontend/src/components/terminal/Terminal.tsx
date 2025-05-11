"use client";

import { useChatStore } from "@/lib/stores/chatStore";
import { useRef, useEffect, useState } from "react";

interface TerminalProps {
  output: string;
  isLoading: boolean;
}

export const Terminal = ({ output, isLoading }: TerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { sendErrorMessage } = useChatStore();

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  // Check for errors in the output
  useEffect(() => {
    if (output && (output.includes("Exception") || output.includes("error"))) {
      setHasError(true);

      // Extract the error message
      // This is a simple extraction - could be enhanced for better error parsing
      const errorLines = output
        .split("\n")
        .filter((line) => line.includes("Exception") || line.includes("error"));

      setErrorMessage(errorLines.length > 0 ? errorLines.join("\n") : output);
    } else {
      setHasError(false);
      setErrorMessage("");
    }
  }, [output]);

  // Handle explain button click
  const handleExplainClick = () => {
    if (errorMessage) {
      sendErrorMessage();
    }
  };

  // Parse and format the output, especially for error messages
  const renderOutput = () => {
    if (!output) {
      return (
        <div className="text-gray-400">
          {isLoading ? "Running code..." : "Run your code to see output here"}
        </div>
      );
    }

    if (output.includes("Exception") || output.includes("error")) {
      return <span className="text-red-500">{output}</span>;
    }

    return output;
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-gray-800 font-jetbrains-mono text-white px-4 py-2 font-semibold border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center">
          <span className="mr-2">Terminal</span>
          {isLoading && (
            <div className="animate-pulse text-xs ml-2 text-gray-400">
              Processing...
            </div>
          )}
        </div>

        {hasError && (
          <button
            onClick={handleExplainClick}
            className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Explain This Error
          </button>
        )}
      </div>
      <div
        ref={terminalRef}
        className="flex-1 bg-gray-900 text-white font-jetbrains-mono p-4 overflow-y-auto whitespace-pre-wrap"
      >
        {renderOutput()}
      </div>
    </div>
  );
};
