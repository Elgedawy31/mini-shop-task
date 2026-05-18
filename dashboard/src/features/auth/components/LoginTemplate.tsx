import type { LoginFormData } from "..";
import { LoginForm } from "..";

function LoginTemplate({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: LoginFormData) => void;
  isPending: boolean;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/90 p-8 shadow-lg backdrop-blur-sm">
        <LoginForm onSubmit={onSubmit} isPending={isPending} />
      </div>
    </div>
  );
}

export default LoginTemplate;
