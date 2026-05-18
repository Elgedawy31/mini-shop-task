import type { LoginFormData } from "..";
import { LoginForm } from "..";

function LoginTemplate({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: LoginFormData) => void;
  isPending;
}) {
  return (
    <div className=" flex items-center  gap-4  p-4">
      <LoginForm onSubmit={onSubmit} isPending={isPending} />
    </div>
  );
}

export default LoginTemplate;
