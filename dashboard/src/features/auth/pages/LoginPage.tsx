import { useEffect } from "react";
import logger from "@/shared/utils/logger";
import { useNavigate } from "react-router-dom";
import { handleApiError, showSuccess } from "@/shared/services/errorHandler";
import { FullScreenLoader } from "@/shared/components/molecules/FullScreenLoader";
import { LoginTemplate, AuthService, type LoginFormData } from "..";
import { useLogin, useSetupStatus } from "../hooks/useAuth";

function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const { data: setupStatus, isLoading: isSetupLoading } = useSetupStatus();

  useEffect(() => {
    if (!isSetupLoading && setupStatus?.needsSetup) {
      navigate("/setup", { replace: true });
    }
  }, [isSetupLoading, setupStatus, navigate]);

  useEffect(() => {
    if (!isSetupLoading && !setupStatus?.needsSetup && AuthService.isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [isSetupLoading, setupStatus, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      logger.info("🚀 Starting login process...", { email: data.email });

      const result = await loginMutation.mutateAsync(data);

      logger.info("✅ Login successful:", result);

      if (!result.token || !AuthService.isAuthenticated()) {
        throw new Error("Login succeeded but the session could not be saved. Please try again.");
      }

      if (result.user?.role !== "admin") {
        AuthService.clearAuthData();
        throw new Error("This dashboard is for admin accounts only.");
      }

      showSuccess("Login successful!");
      navigate("/dashboard", { replace: true });
    } catch (error: unknown) {
      logger.error("❌ Error during login:", error);

      handleApiError(error, {
        context: "Login",
        email: data.email,
      });
    }
  };

  if (isSetupLoading || setupStatus?.needsSetup || AuthService.isAuthenticated()) {
    return <FullScreenLoader message="Loading…" />;
  }

  return (
    <div>
      <LoginTemplate onSubmit={onSubmit} isPending={loginMutation.isPending} />
    </div>
  );
}

export default LoginPage;
