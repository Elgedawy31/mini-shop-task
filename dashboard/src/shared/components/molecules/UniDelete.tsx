import { useState } from "react";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/atoms/dialog";
import { Button } from "@/shared/components/atoms/button";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import logger from "@/shared/utils/logger";
import { ErrorHandler } from "@/shared/services/errorHandler";
import type { UniDeleteProps } from "@/shared/hooks/useUniDelete";

export function UniDelete({
  open,
  onOpenChange,
  itemName,
  itemType,
  onDelete,
  onSuccess,
  onError,
  title,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  showIcon = true,
  errorContext = {},
}: UniDeleteProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const defaultTitle = title || `Delete ${itemType}`;
  const defaultDescription =
    description ||
    `Are you sure you want to delete "${itemName}"? This action cannot be undone and will permanently remove this ${itemType} from the system.`;

  const handleDelete = async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      logger.info(`Starting deletion of ${itemType}:`, { itemName, ...errorContext });

      await onDelete();

      logger.info(`Successfully deleted ${itemType}:`, { itemName, ...errorContext });

      // Close dialog
      onOpenChange(false);

      // Call success callback if provided
      onSuccess?.();
    } catch (error) {
      logger.error(`Failed to delete ${itemType}:`, error);

      // Handle error with ErrorHandler
      ErrorHandler.handleApiError(error, {
        context: `UniDelete - Delete ${itemType}`,
        itemName,
        itemType,
        ...errorContext,
      });

      // Call error callback if provided, otherwise show default error toast
      if (onError) {
        onError(error);
      } else {
        // Show error toast using ErrorHandler
        ErrorHandler.showWarning(`Failed to delete ${itemType}. Please try again.`);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (!isDeleting) {
      onOpenChange(false);
    }
  };

  return (
    <>
      {open && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          {/* Custom animated overlay */}
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => !isDeleting && onOpenChange(false)}
          />

          {/* Dialog content with enhanced animations */}
          <div
            className={cn(
              "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
              "rounded-2xl border bg-background p-6 shadow-2xl",
              "dark:border-border dark:bg-background",
              "light:border-gray-200 light:bg-white"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <DialogHeader>
              {showIcon && (
                <div
                  className={cn(
                    "mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4",
                    "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50",
                    "border border-red-200 dark:border-red-800",
                    "shadow-lg shadow-red-100 dark:shadow-red-900/20"
                  )}
                >
                  <AlertTriangle
                    className={cn("h-7 w-7 text-red-600 dark:text-red-400", "drop-shadow-sm")}
                  />
                </div>
              )}

              <div>
                <DialogTitle
                  className={cn(
                    "text-center text-xl font-semibold leading-6 mb-2",
                    "text-gray-900 dark:text-gray-100"
                  )}
                >
                  {defaultTitle}
                </DialogTitle>

                <DialogDescription
                  className={cn(
                    "text-center text-sm leading-relaxed",
                    "text-gray-600 dark:text-gray-400"
                  )}
                >
                  {defaultDescription}
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="mt-8 flex justify-center sm:justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isDeleting}
                className={cn(
                  "min-w-24 px-6 py-2.5 font-medium transition-all duration-200",
                  "border-gray-300 dark:border-gray-600",
                  "text-gray-700 dark:text-gray-300",
                  "hover:bg-gray-50 dark:hover:bg-gray-800",
                  "hover:border-gray-400 dark:hover:border-gray-500",
                  "hover:shadow-md hover:scale-[1.02]",
                  "active:scale-[0.98]",
                  "focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                )}
              >
                {cancelText}
              </Button>

              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className={cn(
                  "min-w-24 px-6 py-2.5 font-medium transition-all duration-200",
                  "bg-gradient-to-r from-red-600 to-red-700 dark:from-red-600 dark:to-red-700",
                  "hover:from-red-700 hover:to-red-800 dark:hover:from-red-700 dark:hover:to-red-800",
                  "hover:shadow-lg hover:shadow-red-500/25 hover:scale-[1.02]",
                  "active:scale-[0.98]",
                  "focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                  "text-white border-0"
                )}
              >
                {isDeleting ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Deleting...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span>{confirmText}</span>
                  </div>
                )}
              </Button>
            </div>

            {/* Close button */}
            {!isDeleting && (
              <button
                onClick={() => onOpenChange(false)}
                className={cn(
                  "absolute top-4 right-4 rounded-full p-2",
                  "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300",
                  "hover:bg-gray-100 dark:hover:bg-gray-800",
                  "transition-all duration-200 hover:scale-110",
                  "focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                )}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </Dialog>
      )}
    </>
  );
}
