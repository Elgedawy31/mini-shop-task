import { Controller } from "react-hook-form";
import type { Control, FieldError } from "react-hook-form";
import { FormField } from "./FormField";
import { Input } from "../atoms/input";

interface FormInputProps {
  name: string;
  label: string;
  control: Control<any>;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  placeholder?: string;
  required?: boolean;
  error?: FieldError;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export function FormInput({
  name,
  label,
  control,
  type = "text",
  placeholder,
  required = false,
  error,
  description,
  className,
  disabled = false,
}: FormInputProps) {
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
          <Input
            {...field}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            value={field.value || ""}
            onChange={(e) => {
              const value =
                type === "number"
                  ? e.target.value === ""
                    ? ""
                    : Number(e.target.value)
                  : e.target.value;
              field.onChange(value);
            }}
            className="w-full h-11 px-4 py-2 text-sm border border-input bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        )}
      />
    </FormField>
  );
}
