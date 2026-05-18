import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail } from "lucide-react";
import { Button } from "@/shared/components/atoms/button";
import { MemoizedLogo } from "@/shared/components/atoms/Logo";
import { InputWithIcon } from "@/shared/components/molecules/InputWithIcon";
import { PasswordInput } from "@/shared/components/molecules/PasswordInput";
import { setupAdminSchema, type SetupAdminFormData } from "..";

function SetupForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: SetupAdminFormData) => void;
  isPending: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupAdminFormData>({
    resolver: zodResolver(setupAdminSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <div className="w-full space-y-8">
      <MemoizedLogo size="lg" text="Mini Shop" showText />

      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Create your admin</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          No administrator exists yet. Create the first account to manage your Mini Shop dashboard —
          similar to a fresh Payload CMS install.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-foreground">
            Full name
          </label>
          <InputWithIcon
            id="name"
            type="text"
            placeholder="Your name"
            icon={<User className="w-5 h-5" />}
            iconPosition="right"
            {...register("name")}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email
          </label>
          <InputWithIcon
            id="email"
            type="email"
            placeholder="admin@yourshop.com"
            icon={<Mail className="w-5 h-5" />}
            iconPosition="right"
            {...register("email")}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            Password
          </label>
          <PasswordInput
            id="password"
            placeholder="At least 8 characters"
            {...register("password")}
            className={errors.password ? "border-destructive" : ""}
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
            Confirm password
          </label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Repeat password"
            {...register("confirmPassword")}
            className={errors.confirmPassword ? "border-destructive" : ""}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3"
        >
          {isPending ? "Creating admin…" : "Create admin & continue"}
        </Button>
      </form>
    </div>
  );
}

export default SetupForm;
