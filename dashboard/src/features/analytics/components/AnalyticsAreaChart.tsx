import { useMemo } from "react";
import { formatDateLabel } from "@/shared/utils/format";
import type { AnalyticsSeriesPoint } from "@/features/dashboard/types/dashboard";
import { AnalyticsEmptyState } from "./AnalyticsEmptyState";

type AnalyticsAreaChartProps = {
  points: AnalyticsSeriesPoint[];
  tone: "revenue" | "orders";
  valueFormatter: (value: number) => string;
  emptyTitle: string;
  emptyDescription: string;
};

export function AnalyticsAreaChart({
  points,
  tone,
  valueFormatter,
  emptyTitle,
  emptyDescription,
}: AnalyticsAreaChartProps) {
  const hasData = points.some((point) => point.total > 0);

  const chartPoints = useMemo(() => {
    if (points.length === 0) return [];

    const max = Math.max(...points.map((point) => point.total), 1);
    const minX = 24;
    const maxX = 100 - 24;
    const chartHeight = 220;
    const topPadding = 20;

    return points.map((point, index) => {
      const x = points.length === 1 ? 50 : minX + (index / (points.length - 1)) * (maxX - minX);
      const normalized = point.total / max;
      const y = chartHeight - normalized * (chartHeight - topPadding);

      return { ...point, x, y };
    });
  }, [points]);

  if (!hasData) {
    return <AnalyticsEmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const linePath = chartPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${chartPoints[chartPoints.length - 1]?.x ?? 0} 220 L ${
    chartPoints[0]?.x ?? 0
  } 220 Z`;

  const stroke = tone === "revenue" ? "#f59e0b" : "#38bdf8";
  const glow = tone === "revenue" ? "rgba(245, 158, 11, 0.18)" : "rgba(56, 189, 248, 0.18)";
  const areaFill = tone === "revenue" ? "url(#revenue-gradient)" : "url(#orders-gradient)";

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-muted/10 to-transparent p-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_45%)]" />
        <svg viewBox="0 0 100 230" className="h-[320px] w-full">
          <defs>
            <linearGradient id="revenue-gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(245, 158, 11, 0.45)" />
              <stop offset="100%" stopColor="rgba(245, 158, 11, 0.02)" />
            </linearGradient>
            <linearGradient id="orders-gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0.45)" />
              <stop offset="100%" stopColor="rgba(56, 189, 248, 0.02)" />
            </linearGradient>
          </defs>

          {[40, 90, 140, 190].map((y) => (
            <line
              key={y}
              x1="0"
              x2="100"
              y1={y}
              y2={y}
              stroke="rgba(148, 163, 184, 0.14)"
              strokeDasharray="2 3"
            />
          ))}

          <path d={areaPath} fill={areaFill} />
          <path d={linePath} fill="none" stroke={glow} strokeWidth="5" strokeLinecap="round" />
          <path d={linePath} fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />

          {chartPoints.map((point) => (
            <g key={point.date}>
              <circle cx={point.x} cy={point.y} r="3.2" fill={stroke} />
              <circle cx={point.x} cy={point.y} r="6.5" fill={glow} />
            </g>
          ))}
        </svg>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {points.slice(-4).map((point) => (
          <div key={point.date} className="rounded-2xl border border-border/70 bg-muted/15 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {formatDateLabel(point.date)}
            </p>
            <p className="mt-3 text-xl font-semibold">{valueFormatter(point.total)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
