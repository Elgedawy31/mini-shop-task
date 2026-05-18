import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { api } from "@/features/api";
import { theme } from "@/theme/theme";
import { AppText, Button, Card, Screen, VStack } from "@/ui/Primitives";
import { TextField } from "@/ui/TextField";
import { toast } from "@/ui/Toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 3;

  const onSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setSubmitting(true);
    const res = await api.auth.forgotPassword({ email: email.trim() });
    setSubmitting(false);
    if (!res.success) {
      toast("error", "Request failed", res.message);
      return;
    }
    toast("success", "Email sent", "If the account exists, you’ll receive a reset email.");
    router.back();
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <VStack gap={14}>
          <View style={{ gap: 6 }}>
            <AppText size={24} weight="bold">
              Reset password
            </AppText>
            <AppText size={13} color={theme.colors.muted}>
              We’ll send a password reset email via Supabase.
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
              <Button
                label={isSubmitting ? "Sending…" : "Send reset email"}
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
                    Back
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
