import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { router } from "expo-router";

import { api } from "@/features/api";
import { useAuth } from "@/features/auth/AuthContext";
import {
  updateProfileFormSchema,
  type UpdateProfileFormValues,
} from "@/features/auth/profileSchema";
import type { AuthUser } from "@/lib/api/types";
import { theme } from "@/theme/theme";
import { AppText, Button, Card, VStack } from "@/ui/Primitives";
import { FormTextField } from "@/ui/form/FormTextField";
import { toast } from "@/ui/Toast";

type ProfileEditFormProps = {
  user: AuthUser;
  onUpdated: (user: AuthUser) => void;
};

export function ProfileEditForm({ user, onUpdated }: ProfileEditFormProps) {
  const auth = useAuth();

  const { control, handleSubmit, reset, formState } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileFormSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    reset({
      name: user.name,
      email: user.email,
      password: "",
      confirmPassword: "",
    });
  }, [user.email, user.name, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!auth.session?.token) {
      toast("error", "Session expired", "Please sign in again to update your profile.");
      router.replace("/(auth)/sign-in");
      return;
    }

    const trimmedName = values.name.trim();
    const trimmedEmail = values.email.trim();
    const payload: { name?: string; email?: string; password?: string } = {};

    if (trimmedName !== user.name) {
      payload.name = trimmedName;
    }
    if (trimmedEmail !== user.email) {
      payload.email = trimmedEmail;
    }
    if (values.password?.trim()) {
      payload.password = values.password.trim();
    }

    if (!payload.name && !payload.email && !payload.password) {
      toast("info", "No changes", "Update a field before saving.");
      return;
    }

    const res = await api.auth.updateMe(payload);
    if (!res.success) {
      toast("error", "Update failed", res.message);
      return;
    }

    await auth.updateUser(res.data.user);
    onUpdated(res.data.user);
    reset({
      name: res.data.user.name,
      email: res.data.user.email,
      password: "",
      confirmPassword: "",
    });
    toast("success", "Profile updated", "Your account details were saved.");
  });

  return (
    <Card>
      <VStack gap={14}>
        <View style={{ gap: 4 }}>
          <AppText size={15} weight="semibold">
            Account details
          </AppText>
          <AppText size={12} color={theme.colors.muted}>
            Update your name, email, or password.
          </AppText>
        </View>

        <FormTextField
          control={control}
          name="name"
          label="Full name"
          placeholder="Your name"
          icon="user"
        />
        <FormTextField
          control={control}
          name="email"
          label="Email"
          placeholder="you@example.com"
          icon="envelope"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <FormTextField
          control={control}
          name="password"
          label="New password"
          placeholder="Leave blank to keep current"
          icon="lock"
          secureTextEntry
          hint="Minimum 8 characters"
        />
        <FormTextField
          control={control}
          name="confirmPassword"
          label="Confirm password"
          placeholder="Repeat new password"
          icon="lock"
          secureTextEntry
        />

        <Button
          label={formState.isSubmitting ? "Saving…" : "Save changes"}
          onPress={onSubmit}
          loading={formState.isSubmitting}
          disabled={!formState.isDirty && !formState.isSubmitting}
        />
      </VStack>
    </Card>
  );
}
