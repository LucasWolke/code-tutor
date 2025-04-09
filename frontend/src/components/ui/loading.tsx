import React from "react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "xs" | "sm" | "md" | "lg";
  text?: string;
  className?: string;
  noText?: boolean;
}

export function Loading({
  size = "md",
  text = "Loading...",
  className,
  noText = false,
}: LoadingProps) {
  // Set size dimensions based on the size prop
  const sizeStyles = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="animate-spin">
        <div
          className={cn(
            "border-2 rounded-full",
            sizeStyles[size],
            "border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-500"
          )}
        />
      </div>
      {!noText && <p className="text-sm text-gray-500">{text}</p>}
      <span className="sr-only">{text}</span>
    </div>
  );
}
