"use client";

import { useRef, useEffect } from "react";

interface TerminalProps {
  output: string;
  isLoading: boolean;
}

export const Terminal = ({ output, isLoading }: TerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-gray-800 font-jetbrains-mono text-white px-4 py-2 font-semibold border-b border-gray-700 flex items-center">
        <span className="mr-2">Terminal</span>
        {isLoading && (
          <div className="animate-pulse text-xs ml-2 text-gray-400">
            Processing...
          </div>
        )}
      </div>
      <div
        ref={terminalRef}
        className="flex-1 bg-gray-900 text-white font-jetbrains-mono p-4 overflow-y-auto whitespace-pre-wrap"
      >
        {isLoading && !output ? (
          <div className="text-gray-400">Running code...</div>
        ) : output ? (
          output
        ) : (
          <div className="text-gray-400">Run your code to see output here</div>
        )}
      </div>
    </div>
  );
};
