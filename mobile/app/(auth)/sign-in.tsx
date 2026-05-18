import { Link, router } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { api } from "@/features/api";
import { useAuth } from "@/features/auth/AuthContext";
import { sessionStore } from "@/features/auth/session";
import { theme } from "@/theme/theme";
import { AuthLink, AuthLinkRow, AuthScreen } from "@/ui/AuthScreen";
import { AppText, Button, VStack } from "@/ui/Primitives";
import { TextField } from "@/ui/TextField";
import { toast } from "@/ui/Toast";

export default function SignIn() {
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  const canSubmit = email.trim().length > 3 && password.length >= 6;

  const onSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setSubmitting(true);
    const res = await api.auth.login({ email: email.trim(), password });
    setSubmitting(false);
    if (!res.success) {
      toast("error", "Login failed", res.message);
      return;
    }
    await sessionStore.save(res.data);
    setSession({
      token: res.data.token,
      refreshToken: res.data.refreshToken,
      expiresAt: res.data.expiresIn ? Date.now() + res.data.expiresIn * 1000 : undefined,
      user: res.data.user,
    });
    toast("success", "Welcome back", "You’re signed in.");
    router.replace("/(tabs)/shop");
  };

  return (
    <AuthScreen
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
      <VStack gap={16}>
        <TextField
          label="Email"
          icon="envelope-o"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <TextField
          ref={passwordRef}
          label="Password"
          icon="lock"
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />
        <View style={{ marginTop: 4 }}>
          <Button
            label={isSubmitting ? "Signing in…" : "Sign in"}
            onPress={onSubmit}
            loading={isSubmitting}
            disabled={!canSubmit}
          />
        </View>
      </VStack>
    </AuthScreen>
  );
}
