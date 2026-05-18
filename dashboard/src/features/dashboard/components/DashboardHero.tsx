import { Badge } from "@/shared/components/atoms/badge";

type DashboardHeroProps = {
  headline: string;
  description: string;
};

export function DashboardHero({ headline, description }: DashboardHeroProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(245,158,11,0.14),rgba(255,255,255,0.03)_40%,rgba(56,189,248,0.08)_100%)] p-6 sm:p-7">
      <div className="max-w-3xl space-y-4">
        <Badge variant="outline" className="rounded-full bg-background/60 px-3 py-1 text-xs">
          Store control center
        </Badge>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{headline}</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
