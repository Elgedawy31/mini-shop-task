import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/atoms/card";
import { Skeleton } from "@/shared/components/atoms/skeleton";
import type { StatusBreakdown } from "../types/dashboard";

type DashboardInsightsPanelProps = {
  statusCounts?: StatusBreakdown[];
  isLoading: boolean;
};

function getCount(statusCounts: StatusBreakdown[] | undefined, status: StatusBreakdown["status"]) {
  return statusCounts?.find((item) => item.status === status)?.count ?? 0;
}

export function DashboardInsightsPanel({ statusCounts, isLoading }: DashboardInsightsPanelProps) {
  const processing = getCount(statusCounts, "processing");
  const pending = getCount(statusCounts, "pending");
  const delivered = getCount(statusCounts, "delivered");

  const insightCards = [
    {
      label: "Needs attention",
      value: `${pending}`,
      description: "Pending orders that still need a first fulfillment action.",
      icon: AlertCircle,
      tone: "text-amber-500 bg-amber-500/10",
    },
    {
      label: "In progress",
      value: `${processing}`,
      description: "Orders actively moving through handling or shipment prep.",
      icon: Clock3,
      tone: "text-sky-500 bg-sky-500/10",
    },
    {
      label: "Completed",
      value: `${delivered}`,
      description: "Orders already marked delivered and fully closed out.",
      icon: CheckCircle2,
      tone: "text-emerald-500 bg-emerald-500/10",
    },
  ];

  return (
    <Card className="border-border/60 bg-card/85">
      <CardHeader>
        <CardTitle>Operations snapshot</CardTitle>
        <CardDescription>
          Fast operational readout for the current order pipeline without opening a separate report.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-2xl" />
            ))
          : insightCards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-border/70 bg-muted/15 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {card.label}
                    </p>
                    <p className="text-3xl font-bold">{card.value}</p>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </div>
                  <div className={`rounded-2xl p-3 ${card.tone}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ))}
      </CardContent>
    </Card>
  );
}
