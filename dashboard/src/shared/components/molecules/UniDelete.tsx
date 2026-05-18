import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      logger.error(`Failed to delete ${itemType}:`, error);

      ErrorHandler.handleApiError(error, {
        context: `UniDelete - Delete ${itemType}`,
        itemName,
        itemType,
        ...errorContext,
      });

      if (onError) {
        onError(error);
      } else {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl" showCloseButton={!isDeleting}>
        <DialogHeader>
          {showIcon && (
            <div
              className={cn(
                "mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4",
                "bg-destructive/10 border border-destructive/20",
                "text-destructive"
              )}
            >
              <AlertTriangle className="h-7 w-7" aria-hidden />
            </div>
          )}

          <DialogTitle className="text-center text-xl font-semibold text-foreground">
            {defaultTitle}
          </DialogTitle>

          <DialogDescription className="text-center text-sm leading-relaxed">
            {defaultDescription}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 flex justify-center sm:justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
            className="min-w-24"
          >
            {cancelText}
          </Button>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="min-w-24"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                {confirmText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
