import { PageHeader } from "@/shared/components/organisms/PageHeader";
import { useDashboardOverview } from "../hooks/useDashboard";
import { DashboardHero } from "../components/DashboardHero";
import { DashboardInsightsPanel } from "../components/DashboardInsightsPanel";
import { DashboardMetricGrid } from "../components/DashboardMetricGrid";
import { DashboardRecentOrders } from "../components/DashboardRecentOrders";
import { DashboardStatusPanel } from "../components/DashboardStatusPanel";

function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboardOverview();

  return (
    <div className="space-y-8 p-1">
      <PageHeader
        title="Dashboard"
        description="Daily admin pulse across orders, revenue, catalogue health, and recent activity."
      />

      <DashboardHero
        headline="Mini Shop command center"
        description="Track today’s commercial pulse, monitor fulfillment pressure, and keep the storefront sharp from one executive-level overview."
      />

      {isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "Could not load dashboard overview."}
        </div>
      ) : null}

      <DashboardMetricGrid overview={data} isLoading={isLoading} />

      <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <DashboardStatusPanel statusCounts={data?.statusCounts} isLoading={isLoading} />
        <DashboardRecentOrders recentOrders={data?.recentOrders} isLoading={isLoading} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <DashboardInsightsPanel statusCounts={data?.statusCounts} isLoading={isLoading} />
        <DashboardHero
          headline="Senior operator view"
          description="A healthy dashboard should surface action, not just data. Use the metrics above to spot order pileups early, watch revenue momentum, and keep catalogue quality high while the mobile storefront scales."
        />
      </section>
    </div>
  );
}

export default DashboardPage;
