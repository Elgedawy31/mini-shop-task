import logger from "@/shared/utils/logger";
import { useNavigate } from "react-router-dom";
import { handleApiError, showSuccess } from "@/shared/services/errorHandler";
import { LoginTemplate, AuthService, type LoginFormData } from "..";
import { useLogin } from "../hooks/useAuth";

function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const onSubmit = async (data: LoginFormData) => {
    try {
      logger.info("🚀 Starting login process...", { email: data.email });

      const result = await loginMutation.mutateAsync(data);

      logger.info("✅ Login successful:", result);

      if (result.user?.role !== "admin") {
        AuthService.clearAuthData();
        throw new Error("This dashboard is for admin accounts only.");
      }

      showSuccess("Login successful!");
      navigate("/dashboard");
    } catch (error: unknown) {
      logger.error("❌ Error during login:", error);

      handleApiError(error, {
        context: "Login",
        email: data.email,
      });
    }
  };

  return (
    <div>
      <LoginTemplate onSubmit={onSubmit} isPending={loginMutation.isPending} />
    </div>
  );
}

export default LoginPage;
