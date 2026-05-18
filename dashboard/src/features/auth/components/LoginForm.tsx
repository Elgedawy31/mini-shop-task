import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { InputWithIcon } from "@/shared/components/molecules/InputWithIcon";
import { PasswordInput } from "@/shared/components/molecules/PasswordInput";
import { Button } from "@/shared/components/atoms/button";
import { MemoizedLogo } from "@/shared/components/atoms/Logo";
import { loginSchema, type LoginFormData } from "..";
import { Link } from "react-router-dom";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { isSupabaseConfigured } from "@/shared/lib/supabase";

function LoginForm({
  onSubmit,
  onGoogleSignIn,
  isPending,
  isGooglePending,
}: {
  onSubmit: (data: LoginFormData) => void;
  onGoogleSignIn?: () => void;
  isPending: boolean;
  isGooglePending?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12">
      <div className="w-full space-y-8">
        <MemoizedLogo size="lg" text="Mini Shop" showText />

        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Admin sign in</h1>
          <p className="text-muted-foreground">
            Sign in to manage products, orders, and shop analytics.
          </p>
        </div>

        {isSupabaseConfigured() && onGoogleSignIn && (
          <div className="space-y-4">
            <GoogleSignInButton
              onClick={onGoogleSignIn}
              disabled={isPending}
              isLoading={isGooglePending}
            />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email Address
            </label>
            <InputWithIcon
              id="email"
              type="email"
              placeholder="Email address"
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
              placeholder="Password"
              {...register("password")}
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-md transition-colors"
          >
            {isPending ? "Signing in..." : "Login"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don’t have an account?
          <Link to="/sign-up" className="font-medium text-primary hover:underline">
            {" "}
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
