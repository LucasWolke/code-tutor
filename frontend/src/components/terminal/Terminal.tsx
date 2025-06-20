"use client";

import { useChatStore } from "@/lib/stores/chatStore";
import { useEditorStore } from "@/lib/stores/editorStore";
import { useRef, useEffect, useState } from "react";
import {
  Terminal as TerminalIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface TerminalProps {
  output: string;
  isLoading: boolean;
}

export const Terminal = ({ output, isLoading }: TerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { sendErrorMessage } = useChatStore();
  const { testResults, isRunningTests } = useEditorStore();

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  // Check for errors in the output
  useEffect(() => {
    console.log("Checking output for errors:", output);
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

    // Check if this is test results
    if (testResults && output.includes("Test Results:")) {
      return renderTestResults();
    }

    if (output.includes("Exception") || output.includes("error")) {
      return <span className="text-red-500">{output}</span>;
    }

    return output;
  };

  // Render test results with enhanced formatting
  const renderTestResults = () => {
    if (!testResults) return output;

    return (
      <div className="space-y-4">
        <div
          className={`flex items-center font-semibold ${
            testResults.allPassed ? "text-green-400" : "text-red-400"
          }`}
        >
          {testResults.allPassed ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <XCircle className="w-5 h-5 mr-2" />
          )}
          <span>
            Test Results: {testResults.allPassed ? "All Passed" : "Some Failed"}
            ({testResults.results.filter((r) => r.passed).length}/
            {testResults.results.length})
          </span>
        </div>

        <div className="space-y-3">
          {!testResults.executionError &&
            testResults.results.map((result, index) => (
              <div key={index} className="border-l-2 border-gray-600 pl-4 py-2">
                <div
                  className={`flex items-center font-medium mb-2 ${
                    result.passed ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {result.passed ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  <span>
                    Test {index + 1}: {result.passed ? "PASS" : "FAIL"}
                  </span>
                </div>

                <div className="space-y-1 text-sm">
                  {result.testCase.args && (
                    <div className="text-gray-300">
                      <span className="text-gray-400 font-medium">Input:</span>{" "}
                      <span className="text-white">
                        {result.testCase.args.join(",")}
                      </span>
                    </div>
                  )}

                  {!result.passed && (
                    <div className="mt-2 space-y-1">
                      <div className="text-gray-300">
                        <span className="text-gray-400 font-medium">
                          Expected:
                        </span>{" "}
                        <span className="text-green-300">
                          {result.expectedOutput}
                        </span>
                      </div>
                      <div className="text-gray-300">
                        <span className="text-gray-400 font-medium">
                          Actual:
                        </span>{" "}
                        <span className="text-red-300">
                          {result.actualOutput || "No output"}
                        </span>
                      </div>
                      {result.error && (
                        <div className="text-red-400 flex items-start">
                          <AlertCircle className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                          <span>Error: {result.error}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>

        {testResults.executionError && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400">
            <AlertCircle className="w-4 h-4 inline mr-2" />
            Execution Error: {testResults.executionError}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      {" "}
      <div className="bg-gray-800 font-jetbrains-mono text-white px-4 py-2 font-semibold border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center">
          <TerminalIcon className="w-5 h-5 mr-2" />
          <span className="mr-2">Terminal</span>
          {isLoading && (
            <div className="animate-pulse text-xs ml-2 text-gray-400">
              {isRunningTests ? "Running tests..." : "Processing..."}
            </div>
          )}
          {testResults && !isLoading && (
            <div
              className={`text-xs ml-2 px-2 py-1 rounded ${
                testResults.allPassed ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {testResults.allPassed ? "All Tests Passed" : "Tests Failed"}
            </div>
          )}
        </div>

        {testResults?.executionError && (
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
