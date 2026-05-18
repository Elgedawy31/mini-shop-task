import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/atoms/card";
import { Skeleton } from "@/shared/components/atoms/skeleton";
import type { AnalyticsSeriesPoint } from "@/features/dashboard/types/dashboard";
import { AnalyticsAreaChart } from "./AnalyticsAreaChart";

type AnalyticsChartCardProps = {
  title: string;
  description: string;
  isLoading: boolean;
  points: AnalyticsSeriesPoint[];
  tone: "revenue" | "orders";
  valueFormatter: (value: number) => string;
  emptyTitle: string;
  emptyDescription: string;
};

export function AnalyticsChartCard({
  title,
  description,
  isLoading,
  points,
  tone,
  valueFormatter,
  emptyTitle,
  emptyDescription,
}: AnalyticsChartCardProps) {
  return (
    <Card className="border-border/60 bg-card/85">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[420px] rounded-3xl" />
        ) : (
          <AnalyticsAreaChart
            points={points}
            tone={tone}
            valueFormatter={valueFormatter}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
          />
        )}
      </CardContent>
    </Card>
  );
}
