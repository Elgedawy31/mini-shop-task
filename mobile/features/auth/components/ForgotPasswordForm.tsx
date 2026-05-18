import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { View } from "react-native";

import { api } from "@/features/api";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/features/auth/schemas";
import { theme } from "@/theme/theme";
import { FormTextField } from "@/ui/form/FormTextField";
import { AppText, Button, VStack } from "@/ui/Primitives";
import { toast } from "@/ui/Toast";

export function ForgotPasswordForm() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const res = await api.auth.forgotPassword({ email: values.email.trim() });

    if (!res.success) {
      toast("error", "Request failed", res.message);
      return;
    }

    toast("success", "Email sent", "If the account exists, you'll receive a reset email.");
    router.back();
  });

  return (
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
          Reset links expire after a short time. If you don't see the email, check spam or try
          again.
        </AppText>
      </View>

      <FormTextField<ForgotPasswordFormValues>
        control={control}
        name="email"
        label="Email"
        icon="envelope-o"
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
          disabled={!isValid || isSubmitting}
        />
      </View>
    </VStack>
  );
}
