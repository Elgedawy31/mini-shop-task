import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/atoms/dialog";
import { Button } from "@/shared/components/atoms/button";
import React from "react";

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  isLoading = false,
  icon,
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <>
        {open && (
          <DialogContent className="sm:max-w-sm p-6 rounded-xl">
            <div className="w-full">
              <DialogHeader>
                {icon && (
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                    {icon}
                  </div>
                )}
                <DialogTitle className="text-center text-xl font-semibold leading-6">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-center text-sm text-muted-foreground mt-2">
                  {description}
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="mt-6 flex justify-center sm:justify-end gap-2 sm:gap-4">
                <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                  {cancelText}
                </Button>
                <Button variant={variant} onClick={handleConfirm} disabled={isLoading}>
                  {isLoading ? "Loading..." : confirmText}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        )}
      </>
    </Dialog>
  );
}
