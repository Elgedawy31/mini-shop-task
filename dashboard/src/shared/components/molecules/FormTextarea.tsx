import { Controller } from "react-hook-form";
import type { Control, FieldError } from "react-hook-form";
import { FormField } from "./FormField";
import { Textarea } from "../atoms/textarea";

interface FormTextareaProps {
  name: string;
  label: string;
  control: Control<any>;
  placeholder?: string;
  required?: boolean;
  error?: FieldError;
  description?: string;
  className?: string;
  disabled?: boolean;
  rows?: number;
}

export function FormTextarea({
  name,
  label,
  control,
  placeholder,
  required = false,
  error,
  description,
  className,
  disabled = false,
  rows = 4,
}: FormTextareaProps) {
  return (
    <FormField
      label={label}
      required={required}
      error={error}
      description={description}
      className={className}
    >
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            value={field.value || ""}
          />
        )}
      />
    </FormField>
  );
}
