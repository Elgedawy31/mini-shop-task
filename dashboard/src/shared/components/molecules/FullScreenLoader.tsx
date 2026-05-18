import React from "react";
import { cn } from "@/shared/utils/cn";

interface FullScreenLoaderProps {
  message?: string;
  className?: string;
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = React.memo(
  ({ message = "Loading...", className }) => {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-background/80 dark:bg-background/90 backdrop-blur-sm transition-colors",
          className
        )}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex flex-col items-center gap-4 text-center animate-in fade-in zoom-in-90">
          <div className="relative">
            <div
              className="h-10 w-10 rounded-full border-4 border-muted border-t-primary animate-spin"
              aria-hidden="true"
            />
          </div>
          <p className="text-sm font-medium text-muted-foreground dark:text-orange-100">
            {message}
          </p>
        </div>
      </div>
    );
  }
);

FullScreenLoader.displayName = "FullScreenLoader";
