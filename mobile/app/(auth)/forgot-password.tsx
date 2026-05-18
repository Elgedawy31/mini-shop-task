import { router } from "expo-router";

import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { AuthLink, AuthScreen } from "@/ui/AuthScreen";

export default function ForgotPassword() {
  return (
    <AuthScreen
      showBack
      badge="Account recovery"
      title="Reset password"
      subtitle="Enter the email linked to your account. We’ll send you a secure reset link."
      footer={<AuthLink label="Back to sign in" onPress={() => router.back()} accent />}
    >
      <ForgotPasswordForm />
    </AuthScreen>
  );
}
