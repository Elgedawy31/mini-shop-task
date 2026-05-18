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
    className: "bg-green-500 hover:bg-green-600 text-white",
    text: "Connected",
  },
  disconnected: {
    variant: "destructive" as const,
    className: "bg-red-500 hover:bg-red-600 text-white",
    text: "Not connected",
  },
  pending: {
    variant: "secondary" as const,
    className: "bg-yellow-500 hover:bg-yellow-600 text-white",
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
