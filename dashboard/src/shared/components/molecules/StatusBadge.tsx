import React from "react";
import { Badge } from "../atoms/badge";
import { cn } from "../../utils/cn";

interface StatusBadgeProps {
  status: "connected" | "disconnected" | "pending";
  className?: string;
  children?: React.ReactNode;
}

const statusConfig = {
  connected: {
    variant: "default" as const,
    className: "bg-success text-success-foreground hover:bg-success/90 border-transparent",
    text: "Connected",
  },
  disconnected: {
    variant: "destructive" as const,
    className: "bg-destructive text-primary-foreground hover:bg-destructive/90 border-transparent",
    text: "Not connected",
  },
  pending: {
    variant: "secondary" as const,
    className: "bg-warning text-warning-foreground hover:bg-warning/90 border-transparent",
    text: "Pending",
  },
};

export function StatusBadge({ status, className, children }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {children || config.text}
    </Badge>
  );
}
