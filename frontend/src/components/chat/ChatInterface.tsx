"use client";

import { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useChatStore } from "@/lib/stores/chatStore";
import { HelpLevel } from "@/types/chat";
import { helpLevelNames, helpLevelColors } from "@/lib/config/helpLevels";
import { BotMessageSquare } from "lucide-react";

export function ChatInterface() {
  const {
    messages,
    input,
    setInput,
    isLoading,
    selectedHelpLevel,
    setSelectedHelpLevel,
    sendMessage,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    await sendMessage(input);
  };

  return (
    <div className="flex font-jetbrains-mono flex-col h-full bg-gray-900 border-l border-gray-700 overflow-hidden">
      <div className="flex items-center font-jetbrains-mono justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
        <div className="flex items-center">
          <BotMessageSquare className="w-5 h-5 mr-2" />
          <span className="mr-2">Tutor</span>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="helpLevel" className="text-sm text-gray-300">
            Level:
          </label>
          <select
            id="helpLevel"
            className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm text-white"
            value={selectedHelpLevel || ""}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedHelpLevel(
                value ? (parseInt(value) as HelpLevel) : undefined
              );
            }}
          >
            <option value="">Auto-detect</option>
            <option value={HelpLevel.Motivational}>
              {helpLevelNames[HelpLevel.Motivational]}
            </option>
            <option value={HelpLevel.Feedback}>
              {helpLevelNames[HelpLevel.Feedback]}
            </option>
            <option value={HelpLevel.GeneralStrategy}>
              {helpLevelNames[HelpLevel.GeneralStrategy]}
            </option>
            <option value={HelpLevel.ContentStrategy}>
              {helpLevelNames[HelpLevel.ContentStrategy]}
            </option>
            <option value={HelpLevel.Contextual}>
              {helpLevelNames[HelpLevel.Contextual]}
            </option>
          </select>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${
              message.getType() === "human" ? "bg-gray-800" : "bg-gray-700"
            } rounded-lg p-3 text-white break-words`}
          >
            <div className="text-xs text-gray-400 mb-1 flex justify-between items-center">
              <span>{message.getType() === "human" ? "You" : "Tutor"}</span>
              {message.helpLevel && (
                <span
                  className={`px-2 py-0.5 ${
                    helpLevelColors[message.helpLevel]
                  } rounded-full text-xs text-white`}
                >
                  {helpLevelNames[message.helpLevel]}
                </span>
              )}
            </div>
            <div className="whitespace-pre-wrap">
              {message.isLoading ? (
                <>
                  {message.content}
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-100"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200"></div>
                  </div>
                </>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-400 hover:text-blue-300 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      code: ({ className, node, ...props }) => (
                        <code {...props} className={className} />
                      ),
                      pre: ({ node, ...props }) => (
                        <pre
                          {...props}
                          className="bg-gray-600 p-2 rounded overflow-x-auto"
                        />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote
                          {...props}
                          className="border-l-4 border-gray-500 pl-4 italic"
                        />
                      ),
                      h1: ({ node, ...props }) => (
                        <h1 {...props} className="text-xl font-bold mb-2" />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 {...props} className="text-lg font-bold mb-2" />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 {...props} className="text-base font-bold mb-1" />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul {...props} className="list-disc pl-4 space-y-1" />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol
                          {...props}
                          className="list-decimal pl-4 space-y-1"
                        />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong {...props} className="font-bold" />
                      ),
                      em: ({ node, ...props }) => (
                        <em {...props} className="italic" />
                      ),
                    }}
                  >
                    {message.content.toString()}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-700 p-4 bg-gray-800"
      >
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              isLoading || !input.trim() ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
