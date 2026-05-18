import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { View } from "react-native";

import { api } from "@/features/api";
import { useAuth } from "@/features/auth/AuthContext";
import { persistAuthSession } from "@/features/auth/lib/persistSession";
import { registerSchema, type RegisterFormValues } from "@/features/auth/schemas";
import { FormTextField } from "@/ui/form/FormTextField";
import { Button, VStack } from "@/ui/Primitives";
import { toast } from "@/ui/Toast";

export function RegisterForm() {
  const { setSession } = useAuth();

  const {
    control,
    handleSubmit,
    setFocus,
    formState: { isSubmitting, isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const res = await api.auth.register({
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
    });

    if (!res.success) {
      const alreadyExists =
        res.error === "email_already_registered" ||
        res.statusCode === 409 ||
        res.message.toLowerCase().includes("already");

      if (alreadyExists) {
        toast("info", "Account already exists", res.message);
        router.replace("/(auth)/sign-in");
        return;
      }

      toast("error", "Registration failed", res.message);
      return;
    }

    const session = await persistAuthSession(res.data);
    setSession(session);
    toast("success", "Account created", "Welcome to Mini Shop.");
    router.replace("/(tabs)/shop");
  });

  return (
    <VStack gap={16}>
      <FormTextField<RegisterFormValues>
        control={control}
        name="name"
        label="Full name"
        icon="user-o"
        placeholder="Alex Johnson"
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => setFocus("email")}
      />
      <FormTextField<RegisterFormValues>
        control={control}
        name="email"
        label="Email"
        icon="envelope-o"
        placeholder="you@example.com"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => setFocus("password")}
      />
      <FormTextField<RegisterFormValues>
        control={control}
        name="password"
        label="Password"
        icon="lock"
        placeholder="At least 8 characters"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        hint="Use 8+ characters with a mix of letters and numbers."
      />
      <View style={{ marginTop: 4 }}>
        <Button
          label={isSubmitting ? "Creating account…" : "Create account"}
          onPress={onSubmit}
          loading={isSubmitting}
          disabled={!isValid || isSubmitting}
        />
      </View>
    </VStack>
  );
}
