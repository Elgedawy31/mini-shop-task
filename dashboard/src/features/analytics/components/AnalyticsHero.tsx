import { Badge } from "@/shared/components/atoms/badge";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/atoms/tabs";
import type { SeriesRange } from "@/features/dashboard/types/dashboard";

type AnalyticsHeroProps = {
  range: SeriesRange;
  onRangeChange: (range: SeriesRange) => void;
};

export function AnalyticsHero({ range, onRangeChange }: AnalyticsHeroProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(245,158,11,0.12),rgba(56,189,248,0.05)_40%,transparent_72%)] p-5 sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-3">
          <Badge variant="outline" className="rounded-full bg-background/60 px-3 py-1 text-xs">
            Executive snapshot
          </Badge>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Trend intelligence</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Compare revenue momentum and order activity over the last{" "}
              {range === "7d" ? "week" : "month"} with a cleaner view that stays readable even when
              the store is still ramping up.
            </p>
          </div>
        </div>

        <Tabs value={range} onValueChange={(value) => onRangeChange(value as SeriesRange)}>
          <TabsList className="rounded-2xl p-1">
            <TabsTrigger value="7d" className="rounded-xl px-4">
              Last 7 days
            </TabsTrigger>
            <TabsTrigger value="30d" className="rounded-xl px-4">
              Last 30 days
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </section>
  );
}
