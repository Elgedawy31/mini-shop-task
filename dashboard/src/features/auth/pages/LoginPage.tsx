import logger from "@/shared/utils/logger";
import { useNavigate } from "react-router-dom";
import { handleApiError, showSuccess } from "@/shared/services/errorHandler";
import { LoginTemplate, useLogin, type LoginFormData } from "..";

function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const onSubmit = async (data: LoginFormData) => {
    try {
      logger.info("🚀 Starting login process...", { email: data.email });

      // Use the professional mutation system
      const result = await loginMutation.mutateAsync(data);

      logger.info("✅ Login successful:", result);

      // Show success toast and redirect
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
  return (
    <div>
      <LoginTemplate onSubmit={onSubmit} isPending={loginMutation.isPending} />
    </div>
  );
}

export default LoginPage;
