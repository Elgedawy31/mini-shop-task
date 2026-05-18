import type { SetupAdminFormData } from "..";
import SetupForm from "./SetupForm";

function SetupTemplate({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: SetupAdminFormData) => void;
  isPending: boolean;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/90 p-8 shadow-lg backdrop-blur-sm">
        <SetupForm onSubmit={onSubmit} isPending={isPending} />
      </div>
    </div>
  );
}

export default SetupTemplate;
