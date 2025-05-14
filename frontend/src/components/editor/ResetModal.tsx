"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEditorStore } from "@/lib/stores/editorStore";

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResetModal({ isOpen, onClose }: ResetModalProps) {
  if (!isOpen) return null;

  const confirmReset = () => {
    useEditorStore.getState().loadProblemBoilerplate();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2 text-amber-500" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Reset Code
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-5">
          This will reset your code to the original problem boilerplate. All
          your changes will be lost. Are you sure you want to continue?
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={confirmReset}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Reset Code
          </button>
        </div>
      </div>
    </div>
  );
}
