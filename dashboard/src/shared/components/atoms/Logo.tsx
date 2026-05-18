import React, { useCallback } from "react";
import { Store } from "lucide-react";
import { cn } from "../../utils/cn";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  showText?: boolean;
  text?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
  xl: "h-12 w-12",
  full: "h-10 w-10",
};

const iconSizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
  xl: "h-6 w-6",
  full: "h-5 w-5",
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  full: "text-lg",
};

export function Logo({
  size = "md",
  className,
  showText = true,
  text = "Mini Shop",
  onClick,
}: LogoProps) {
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        onClick && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
    >
      <div
        className={cn(
          sizeClasses[size],
          "rounded-lg flex items-center justify-center bg-primary text-primary-foreground shadow-sm shrink-0"
        )}
        aria-hidden
      >
        <Store className={iconSizeClasses[size]} />
      </div>

      {showText && (
        <span
          className={cn(
            "font-semibold text-foreground truncate",
            textSizeClasses[size],
            size !== "full" && "hidden sm:block"
          )}
        >
          {text}
        </span>
      )}
    </div>
  );
}

export const MemoizedLogo = React.memo(Logo);
