import React from "react";
import type { FieldError } from "react-hook-form";
import { cn } from "../../utils/cn";

interface FormFieldProps {
  label: string;
  error?: FieldError;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  description?: string;
}

export function FormField({
  label,
  error,
  required = false,
  children,
  className,
  description,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          "text-foreground dark:text-foreground"
        )}
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>

      {description && (
        <p className={cn("text-xs text-muted-foreground dark:text-muted-foreground")}>
          {description}
        </p>
      )}

      {children}

      {error && (
        <p
          className={cn(
            "text-xs text-destructive dark:text-destructive",
            "animate-in slide-in-from-top-1 duration-200"
          )}
        >
          {error.message}
        </p>
      )}
    </div>
  );
}
