"use client";

import { useState, useRef, useEffect } from "react";
import { aiService, generateResponse } from "@/lib/services/ai/aiService";
import { ChatMessage } from "@/lib/services/ai/types";
import { useEditorStore } from "@/lib/stores/editorStore";
import { HelpLevel } from "@/lib/langchain/types";
import { v4 as uuidv4 } from "uuid";

// Map help levels to strings
const helpLevelNames = {
  [HelpLevel.Motivational]: "Motivational",
  [HelpLevel.Feedback]: "Feedback",
  [HelpLevel.GeneralStrategy]: "General Strategy",
  [HelpLevel.ContentStrategy]: "Content Strategy",
  [HelpLevel.Contextual]: "Contextual",
};

// Map help levels to colors
const helpLevelColors = {
  [HelpLevel.Motivational]: "bg-purple-600",
  [HelpLevel.Feedback]: "bg-blue-600",
  [HelpLevel.GeneralStrategy]: "bg-green-600",
  [HelpLevel.ContentStrategy]: "bg-yellow-600",
  [HelpLevel.Contextual]: "bg-red-600",
};

// Enhanced chat message with help level
interface EnhancedChatMessage extends ChatMessage {
  helpLevel?: HelpLevel;
  isLoading?: boolean;
}

export function ChatInterface() {
  const { code, getSelectedModel } = useEditorStore();
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your Java coding tutor. How can I help you today? I can provide assistance at different levels based on your needs.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => uuidv4());
  const [userId] = useState(() => "user-" + uuidv4().substring(0, 8));
  const [selectedHelpLevel, setSelectedHelpLevel] = useState<
    HelpLevel | undefined
  >(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize the session when component mounts
  useEffect(() => {
    aiService.setSessionId(sessionId);
    aiService.setUserId(userId);
  }, [sessionId, userId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message to chat
    const userMessage: EnhancedChatMessage = {
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Add loading placeholder message
    const loadingMessage: EnhancedChatMessage = {
      role: "assistant",
      content: "Thinking...",
      isLoading: true,
    };

    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // Use non-streaming response
      const response = await generateResponse(input, code, {
        helpLevel: selectedHelpLevel,
      });

      // Replace loading message with response
      setMessages((prevMessages) => {
        const messagesWithoutLoading = prevMessages.filter(
          (msg) => !msg.isLoading
        );
        return [
          ...messagesWithoutLoading,
          {
            role: "assistant",
            content: response.text,
            helpLevel: response.helpLevel,
          },
        ];
      });
    } catch (error) {
      // Handle error
      setMessages((prevMessages) => {
        const messagesWithoutLoading = prevMessages.filter(
          (msg) => !msg.isLoading
        );
        return [
          ...messagesWithoutLoading,
          {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again later.",
          },
        ];
      });
      console.error("AI chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get the current selected model
  const selectedModel = getSelectedModel();

  return (
    <div className="flex font-jetbrains-mono flex-col h-full bg-gray-900 border-l border-gray-700 overflow-hidden">
      <div className="flex items-center font-jetbrains-mono justify-between bg-gray-800 px-4 py-3 border-b border-gray-700">
        <div className="flex items-center">
          <span className="mr-2">AI Tutor</span>
          <span className="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-300">
            {selectedModel.name}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="helpLevel" className="text-sm text-gray-300">
            Help Level:
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
              message.role === "user" ? "bg-gray-800" : "bg-gray-700"
            } rounded-lg p-3 text-white break-words`}
          >
            <div className="text-xs text-gray-400 mb-1 flex justify-between items-center">
              <span>{message.role === "user" ? "You" : "Assistant"}</span>
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
                message.content
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
