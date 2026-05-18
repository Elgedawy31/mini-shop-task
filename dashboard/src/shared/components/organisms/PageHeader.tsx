import { cn } from "@/shared/utils/cn";
import { Button } from "../atoms/button";
import type { ComponentType } from "react";

export interface PageHeaderAction {
  label: string;
  onClick: () => void;
  icon?: ComponentType<{ className?: string }>;
  variant?: "default" | "outline" | "secondary" | "destructive";
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: PageHeaderAction[];
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions = [],
  className,
}) => {
  return (
    <header
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm leading-relaxed max-w-prose">{description}</p>
        )}
      </div>

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {actions.slice(0, 2).map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                type="button"
                onClick={action.onClick}
                variant={action.variant ?? "default"}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg cursor-pointer"
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span className="">{action.label}</span>
              </Button>
            );
          })}
        </div>
      )}
    </header>
  );
};
