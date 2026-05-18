import { cn } from "@/shared/utils/cn";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Input } from "../atoms/input";

interface InputWithIconProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  containerClassName?: string;
}

export const InputWithIcon = ({
  icon,
  iconPosition = "right",
  className,
  containerClassName,
  ...props
}: InputWithIconProps) => {
  const hasIcon = !!icon;

  return (
    <div className={cn("relative flex items-center", containerClassName)}>
      {hasIcon && iconPosition === "left" && (
        <span className="absolute left-3 text-zinc-500">{icon}</span>
      )}

      <Input
        className={cn(hasIcon ? (iconPosition === "left" ? "pl-10" : "pr-10") : "", className)}
        {...props}
      />

      {hasIcon && iconPosition === "right" && (
        <span className="absolute right-3 text-zinc-500">{icon}</span>
      )}
    </div>
  );
};
