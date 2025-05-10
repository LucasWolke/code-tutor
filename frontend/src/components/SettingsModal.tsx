import React, { useState } from "react";
import { useEditorStore } from "@/lib/stores/editorStore";
import { AIProvider, availableModels } from "@/lib/config/models";

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setSettingsOpen,
    selectedModelId,
    setSelectedModel,
    availableThemes,
    selectedTheme,
    setSelectedTheme,
  } = useEditorStore();

  const [activeTab, setActiveTab] = useState<"model" | "theme">("model");

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={selectedTheme.color}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
          <button
            className={`py-2 px-4 mr-2 ${
              activeTab === "model"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400"
            }`}
            onClick={() => setActiveTab("model")}
          >
            AI Model
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === "theme"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400"
            }`}
            onClick={() => setActiveTab("theme")}
          >
            Editor Theme
          </button>
        </div>

        {/* Model Selection Tab */}
        {activeTab === "model" && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Select the AI model to use for code assistance
            </p>

            <div className="space-y-2">
              {availableModels.map((model) => (
                <div
                  key={model.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedModelId === model.id
                      ? "bg-blue-100 dark:bg-blue-900 border-blue-500"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
                  }`}
                  onClick={() => setSelectedModel(model.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{model.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {model.description}
                      </p>
                    </div>
                    <div className="text-xs font-medium px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700">
                      {model.provider === AIProvider.OpenAI
                        ? "OpenAI"
                        : "Gemini"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Theme Selection Tab */}
        {activeTab === "theme" && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Select your preferred editor theme
            </p>

            <div className="space-y-2">
              {availableThemes.map((theme) => (
                <div
                  key={theme.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTheme.id === theme.id
                      ? "bg-blue-100 dark:bg-blue-900 border-blue-500"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
                  }`}
                  onClick={() => setSelectedTheme(theme.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{theme.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {theme.description}
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded border ${theme.color}`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={() => setSettingsOpen(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
