import { Sparkles } from "lucide-react";

type AnalyticsEmptyStateProps = {
  title: string;
  description: string;
};

export function AnalyticsEmptyState({ title, description }: AnalyticsEmptyStateProps) {
  return (
    <div className="flex h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-muted/10 px-6 text-center">
      <div className="mb-4 rounded-2xl bg-primary/10 p-3 text-primary">
        <Sparkles className="h-5 w-5" />
      </div>
      <p className="text-lg font-semibold">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
