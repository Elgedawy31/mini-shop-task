import { router } from "expo-router";
import { useRef, useState } from "react";
import { TextInput, View } from "react-native";

import { api } from "@/features/api";
import { useAuth } from "@/features/auth/AuthContext";
import { sessionStore } from "@/features/auth/session";
import { AuthLink, AuthScreen } from "@/ui/AuthScreen";
import { Button, VStack } from "@/ui/Primitives";
import { TextField } from "@/ui/TextField";
import { toast } from "@/ui/Toast";

export default function Register() {
  const { setSession } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

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
    <AuthScreen
      showBack
      badge="New account"
      title="Create account"
      subtitle="Join Mini Shop for a polished shopping experience with fast checkout and order tracking."
      footer={
        <AuthLink label="Already have an account? Sign in" onPress={() => router.back()} accent />
      }
    >
      <VStack gap={16}>
        <TextField
          label="Full name"
          icon="user-o"
          value={name}
          onChangeText={setName}
          placeholder="Alex Johnson"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        <TextField
          ref={emailRef}
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
          placeholder="At least 6 characters"
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          hint="Use 6+ characters with a mix of letters and numbers for better security."
        />
        <View style={{ marginTop: 4 }}>
          <Button
            label={isSubmitting ? "Creating account…" : "Create account"}
            onPress={onSubmit}
            loading={isSubmitting}
            disabled={!canSubmit}
          />
        </View>
      </VStack>
    </AuthScreen>
  );
}
