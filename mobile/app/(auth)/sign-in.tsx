import { Link, router } from "expo-router";
import { Pressable } from "react-native";

import { SignInForm } from "@/features/auth/components/SignInForm";
import { theme } from "@/theme/theme";
import { AuthLink, AuthLinkRow, AuthScreen } from "@/ui/AuthScreen";
import { AppText } from "@/ui/Primitives";

export default function SignIn() {
  return (
    <AuthScreen
      screenKey="sign-in"
      badge="Welcome back"
      title="Sign in"
      subtitle="Access your account to browse products, manage your cart, and track orders."
      footer={
        <AuthLinkRow>
          <AuthLink
            label="Forgot password?"
            onPress={() => router.push("/(auth)/forgot-password")}
            accent
          />
          <AppText size={13} color={theme.colors.muted}>
            ·
          </AppText>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              {({ pressed }) => (
                <AppText
                  size={13}
                  weight="semibold"
                  color={theme.colors.muted}
                  style={{ opacity: pressed ? 0.75 : 1 }}
                >
                  Create account
                </AppText>
              )}
            </Pressable>
          </Link>
        </AuthLinkRow>
      }
    >
      <SignInForm />
    </AuthScreen>
  );
}
