import type { ComponentType } from "react";
import { Card, CardContent } from "@/shared/components/atoms/card";

type DashboardMetricCardProps = {
  label: string;
  value: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  accent?: "amber" | "sky" | "emerald" | "rose";
};

const ACCENT_STYLES = {
  amber: "bg-amber-500/10 text-amber-500",
  sky: "bg-sky-500/10 text-sky-500",
  emerald: "bg-emerald-500/10 text-emerald-500",
  rose: "bg-rose-500/10 text-rose-500",
};

export function DashboardMetricCard({
  label,
  value,
  description,
  icon: Icon,
  accent = "amber",
}: DashboardMetricCardProps) {
  return (
    <Card className="border-border/60 bg-card/85 backdrop-blur-sm">
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {label}
          </p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className={`rounded-2xl p-3 ${ACCENT_STYLES[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
