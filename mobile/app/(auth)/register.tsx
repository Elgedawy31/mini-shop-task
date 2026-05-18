import { router } from "expo-router";

import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { AuthLink, AuthScreen } from "@/ui/AuthScreen";

export default function Register() {
  return (
    <AuthScreen
      screenKey="register"
      showBack
      badge="New account"
      title="Create account"
      subtitle="Join Mini Shop for a polished shopping experience with fast checkout and order tracking."
      footer={
        <AuthLink label="Already have an account? Sign in" onPress={() => router.back()} accent />
      }
    >
      <RegisterForm />
    </AuthScreen>
  );
}
