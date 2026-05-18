import { useState } from "react";
import logger from "@/shared/utils/logger";
import { useNavigate } from "react-router-dom";
import { handleApiError, showSuccess } from "@/shared/services/errorHandler";
import { LoginTemplate, AuthService, type LoginFormData } from "..";
import { useLogin } from "../hooks/useAuth";
import { signInWithGoogle } from "../services/googleAuth";
import { isSupabaseConfigured } from "@/shared/lib/supabase";

function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const [isGooglePending, setIsGooglePending] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    try {
      logger.info("🚀 Starting login process...", { email: data.email });

      // Use the professional mutation system
      const result = await loginMutation.mutateAsync(data);

      logger.info("✅ Login successful:", result);

      if (result.user?.role !== "admin") {
        AuthService.clearAuthData();
        throw new Error("This dashboard is for admin accounts only.");
      }

      showSuccess("Login successful!");
      navigate("/dashboard");
    } catch (error: any) {
      logger.error("❌ Error during login:", error);

      // Error handling
      handleApiError(error, {
        context: "Login",
        email: data.email,
      });
    }
  };
  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured()) {
      handleApiError(
        new Error(
          "Google sign-in is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to dashboard/.env.development."
        ),
        { context: "Google sign-in" }
      );
      return;
    }

    try {
      setIsGooglePending(true);
      await signInWithGoogle();
    } catch (error) {
      setIsGooglePending(false);
      handleApiError(error, { context: "Google sign-in" });
    }
  };

  return (
    <div>
      <LoginTemplate
        onSubmit={onSubmit}
        onGoogleSignIn={handleGoogleSignIn}
        isPending={loginMutation.isPending}
        isGooglePending={isGooglePending}
      />
    </div>
  );
}

export default LoginPage;
