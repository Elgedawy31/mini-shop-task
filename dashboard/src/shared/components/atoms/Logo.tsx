import React, { useState, useCallback } from "react";
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
  full: "w-full",
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

export function Logo({
  size = "md",
  className,
  showText = true,
  text = "Central Hub",
  onClick,
}: LogoProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setIsLoading(false);
  }, []);

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  // Fallback component when image fails to load
  const FallbackLogo = () => (
    <div
      className={cn(
        sizeClasses[size],
        "rounded-lg flex items-center justify-center font-bold text-primary-foreground",
        "bg-primary shadow-sm",
        "dark:bg-primary"
      )}
    >
      <span
        className={cn(
          size === "sm"
            ? "text-xs"
            : size === "md"
              ? "text-sm"
              : size === "lg"
                ? "text-base"
                : "text-lg"
        )}
      >
        C
      </span>
    </div>
  );

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
      {/* Logo Image */}
      <div className="relative">
        {/* Loading skeleton */}
        {isLoading && !imageError && (
          <div
            className={cn(sizeClasses[size], "bg-muted animate-pulse rounded-lg", "dark:bg-muted")}
          />
        )}

        {/* Actual logo image */}
        {!imageError && (
          <img
            src="/logo.png"
            alt={`${text} Logo`}
            className={cn(sizeClasses[size], "object-contain rounded-lg", isLoading && "opacity-0")}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="eager" // Load immediately since it's likely above the fold
            decoding="async"
          />
        )}

        {/* Fallback logo */}
        {imageError && <FallbackLogo />}
      </div>

      {/* Logo Text */}
      {showText && (
        <span
          className={cn(
            "font-semibold text-foreground dark:text-foreground",
            textSizeClasses[size],
            "hidden sm:block" // Hide on mobile by default
          )}
        >
          {text}
        </span>
      )}
    </div>
  );
}

// Memoized version for better performance
export const MemoizedLogo = React.memo(Logo);
