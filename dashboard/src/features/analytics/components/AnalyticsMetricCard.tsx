import type { ComponentType } from "react";
import { Card, CardContent } from "@/shared/components/atoms/card";

type AnalyticsMetricCardProps = {
  title: string;
  value: string;
  hint: string;
  icon: ComponentType<{ className?: string }>;
};

export function AnalyticsMetricCard({ title, value, hint, icon: Icon }: AnalyticsMetricCardProps) {
  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground">{hint}</p>
        </div>
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
