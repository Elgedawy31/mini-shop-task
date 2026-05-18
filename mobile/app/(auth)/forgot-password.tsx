import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { api } from "@/features/api";
import { AuthLink, AuthScreen } from "@/ui/AuthScreen";
import { AppText, Button, VStack } from "@/ui/Primitives";
import { theme } from "@/theme/theme";
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
    <AuthScreen
      showBack
      badge="Account recovery"
      title="Reset password"
      subtitle="Enter the email linked to your account. We’ll send you a secure reset link."
      footer={<AuthLink label="Back to sign in" onPress={() => router.back()} accent />}
    >
      <VStack gap={16}>
        <View
          style={{
            padding: theme.space[4],
            borderRadius: theme.radii.lg,
            backgroundColor: "rgba(96,165,250,0.08)",
            borderWidth: 1,
            borderColor: "rgba(96,165,250,0.22)",
            gap: 6,
          }}
        >
          <AppText size={13} weight="semibold" color={theme.colors.info}>
            Check your inbox
          </AppText>
          <AppText size={12} color={theme.colors.muted} style={{ lineHeight: 18 }}>
            Reset links expire after a short time. If you don’t see the email, check spam or try
            again.
          </AppText>
        </View>

        <TextField
          label="Email"
          icon="envelope-o"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />

        <View style={{ marginTop: 4 }}>
          <Button
            label={isSubmitting ? "Sending…" : "Send reset email"}
            onPress={onSubmit}
            loading={isSubmitting}
            disabled={!canSubmit}
          />
        </View>
      </VStack>
    </AuthScreen>
  );
}
