import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { api } from "@/features/api";
import { useAuth } from "@/features/auth/AuthContext";
import { sessionStore } from "@/features/auth/session";
import { theme } from "@/theme/theme";
import { AppText, Button, Card, Screen, VStack } from "@/ui/Primitives";
import { TextField } from "@/ui/TextField";
import { toast } from "@/ui/Toast";

export default function SignIn() {
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

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
    <Screen>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <VStack gap={14}>
          <View style={{ gap: 6 }}>
            <AppText size={24} weight="bold">
              Sign in
            </AppText>
            <AppText size={13} color={theme.colors.muted}>
              Access your Mini Shop account to browse and place orders.
            </AppText>
          </View>

          <Card>
            <VStack gap={14}>
              <TextField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
              />
              <TextField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
                secureTextEntry
              />
              <Button
                label={isSubmitting ? "Signing in…" : "Sign in"}
                onPress={onSubmit}
                loading={isSubmitting}
                disabled={!canSubmit}
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Link href="/(auth)/forgot-password" asChild>
                  <Pressable>
                    {({ pressed }) => (
                      <AppText
                        size={12}
                        weight="medium"
                        color={theme.colors.primary2}
                        style={{ opacity: pressed ? 0.7 : 1 }}
                      >
                        Forgot password?
                      </AppText>
                    )}
                  </Pressable>
                </Link>
                <Link href="/(auth)/register" asChild>
                  <Pressable>
                    {({ pressed }) => (
                      <AppText
                        size={12}
                        weight="medium"
                        color={theme.colors.text}
                        style={{ opacity: pressed ? 0.7 : 1 }}
                      >
                        Create account
                      </AppText>
                    )}
                  </Pressable>
                </Link>
              </View>
            </VStack>
          </Card>
        </VStack>
      </View>
    </Screen>
  );
}
