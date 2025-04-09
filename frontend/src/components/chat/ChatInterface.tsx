import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SendIcon, PlusIcon, LoaderIcon, XCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatInterfaceProps {
  initialPrompt?: string;
  onSendMessage: (message: string) => Promise<void>;
  messages: Message[];
  isProcessing: boolean;
  onReset: () => void;
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  initialPrompt = "",
  onSendMessage,
  messages,
  isProcessing,
  onReset,
  className,
}) => {
  const [input, setInput] = useState(initialPrompt);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize the textarea as content grows
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    await onSendMessage(input.trim());
    setInput("");

    // Reset the textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={cn("flex flex-col h-full border rounded-md", className)}>
      <div className="flex justify-between items-center p-3 border-b bg-gray-50">
        <h3 className="font-medium">AI Assistant</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-gray-500 hover:text-gray-700"
        >
          <PlusIcon size={16} className="mr-1" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Ask the AI assistant for help with your Java code.</p>
            <p className="text-sm mt-2">
              Try: "Explain this code" or "Help me fix the errors"
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "p-3 rounded-lg max-w-[85%]",
                message.role === "user" ? "bg-blue-100 ml-auto" : "bg-gray-100",
                message.isLoading && "opacity-70"
              )}
            >
              <div className="flex items-center mb-1">
                <span className="font-medium text-xs text-gray-700">
                  {message.role === "user" ? "You" : "AI Assistant"}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="whitespace-pre-wrap">
                {message.content}
                {message.isLoading && (
                  <LoaderIcon
                    className="inline-block ml-2 animate-spin"
                    size={14}
                  />
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t p-3">
        <div className="flex items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask for help with your code..."
            className="flex-1 resize-none border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[42px] max-h-[200px]"
            rows={1}
            disabled={isProcessing}
          />
          <Button
            type="submit"
            className="ml-2"
            disabled={isProcessing || !input.trim()}
          >
            {isProcessing ? (
              <LoaderIcon className="animate-spin" size={18} />
            ) : (
              <SendIcon size={18} />
            )}
          </Button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Press Ctrl+Enter to send
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
