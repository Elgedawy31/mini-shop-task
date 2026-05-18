import { Controller } from "react-hook-form";
import type { Control, FieldError } from "react-hook-form";
import { FormField } from "./FormField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../atoms/select";

interface SelectOption {
  readonly value: string;
  readonly label: string;
}

interface FormSelectProps {
  name: string;
  label: string;
  control: Control<any>;
  options: readonly SelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: FieldError;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export function FormSelect({
  name,
  label,
  control,
  options,
  placeholder = "Select an option",
  required = false,
  error,
  description,
  className,
  disabled = false,
}: FormSelectProps) {
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
          <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
            <SelectTrigger className="w-full h-11 px-4 py-2 text-sm border border-input bg-background ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FormField>
  );
}
