import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { api } from "@/features/api";
import { useAuth } from "@/features/auth/AuthContext";
import { sessionStore } from "@/features/auth/session";
import { theme } from "@/theme/theme";
import { AppText, Button, Card, Screen, VStack } from "@/ui/Primitives";
import { TextField } from "@/ui/TextField";
import { toast } from "@/ui/Toast";

export default function Register() {
  const { setSession } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const canSubmit = name.trim().length >= 2 && email.trim().length > 3 && password.length >= 6;

  const onSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setSubmitting(true);
    const res = await api.auth.register({ name: name.trim(), email: email.trim(), password });
    setSubmitting(false);
    if (!res.success) {
      toast("error", "Registration failed", res.message);
      return;
    }
    await sessionStore.save(res.data);
    setSession({
      token: res.data.token,
      refreshToken: res.data.refreshToken,
      expiresAt: res.data.expiresIn ? Date.now() + res.data.expiresIn * 1000 : undefined,
      user: res.data.user,
    });
    toast("success", "Account created", "Welcome to Mini Shop.");
    router.replace("/(tabs)/shop");
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <VStack gap={14}>
          <View style={{ gap: 6 }}>
            <AppText size={24} weight="bold">
              Create account
            </AppText>
            <AppText size={13} color={theme.colors.muted}>
              A clean storefront experience with fast checkout.
            </AppText>
          </View>

          <Card>
            <VStack gap={14}>
              <TextField
                label="Name"
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                autoCapitalize="words"
              />
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
                placeholder="Create a password"
                secureTextEntry
              />
              <Button
                label={isSubmitting ? "Creating…" : "Create account"}
                onPress={onSubmit}
                loading={isSubmitting}
                disabled={!canSubmit}
              />

              <Pressable onPress={() => router.back()}>
                {({ pressed }) => (
                  <AppText
                    size={12}
                    weight="medium"
                    color={theme.colors.primary2}
                    style={{ opacity: pressed ? 0.7 : 1, textAlign: "center" }}
                  >
                    Back to sign in
                  </AppText>
                )}
              </Pressable>
            </VStack>
          </Card>
        </VStack>
      </View>
    </Screen>
  );
}
