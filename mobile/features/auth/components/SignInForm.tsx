import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { View } from "react-native";

import { api } from "@/features/api";
import { useAuth } from "@/features/auth/AuthContext";
import { persistAuthSession } from "@/features/auth/lib/persistSession";
import { signInSchema, type SignInFormValues } from "@/features/auth/schemas";
import { FormTextField } from "@/ui/form/FormTextField";
import { Button, VStack } from "@/ui/Primitives";
import { toast } from "@/ui/Toast";

export function SignInForm() {
  const { setSession } = useAuth();

  const {
    control,
    handleSubmit,
    setFocus,
    formState: { isSubmitting, isValid },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const res = await api.auth.login({
      email: values.email.trim(),
      password: values.password,
    });

    if (!res.success) {
      toast("error", "Login failed", res.message);
      return;
    }

    const session = await persistAuthSession(res.data);
    setSession(session);
    toast("success", "Welcome back", "You're signed in.");
    router.replace("/(tabs)/shop");
  });

  return (
    <VStack gap={16}>
      <FormTextField<SignInFormValues>
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
      <FormTextField<SignInFormValues>
        control={control}
        name="password"
        label="Password"
        icon="lock"
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
          disabled={!isValid || isSubmitting}
        />
      </View>
    </VStack>
  );
}
