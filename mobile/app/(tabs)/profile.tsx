import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";

import { api } from "@/features/api";
import { useAuth } from "@/features/auth/AuthContext";
import { theme } from "@/theme/theme";
import { AppText, Button, Card, Screen, VStack } from "@/ui/Primitives";
import { toast } from "@/ui/Toast";

export default function Profile() {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(auth.session?.user);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!auth.session?.token) return;
      setLoading(true);
      const res = await api.auth.me();
      setLoading(false);
      if (cancelled) return;
      if (res.success) {
        setProfile(res.data.user);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth.session?.token]);

  return (
    <Screen>
      <VStack gap={14} style={{ flex: 1 }}>
        <View style={{ gap: 4 }}>
          <AppText size={22} weight="bold">
            Profile
          </AppText>
          <AppText size={12} color={theme.colors.muted}>
            Account details and session controls.
          </AppText>
        </View>

        {!auth.session?.token ? (
          <Card>
            <VStack gap={12}>
              <AppText weight="bold">You’re not signed in</AppText>
              <AppText size={12} color={theme.colors.muted}>
                Sign in to place orders and view order history.
              </AppText>
              <Button label="Sign in" onPress={() => router.replace("/(auth)/sign-in")} />
            </VStack>
          </Card>
        ) : (
          <>
            <Card>
              <VStack gap={10}>
                <AppText weight="bold">{profile?.name ?? "Customer"}</AppText>
                <AppText size={12} color={theme.colors.muted}>
                  {profile?.email ?? "—"}
                </AppText>
                <AppText size={12} color={theme.colors.muted}>
                  Role: {profile?.role ?? "customer"}
                </AppText>
                {loading ? (
                  <AppText size={12} color={theme.colors.muted}>
                    Syncing profile…
                  </AppText>
                ) : null}
              </VStack>
            </Card>

            <Card>
              <VStack gap={12}>
                <Button
                  variant="secondary"
                  label="Log out"
                  onPress={async () => {
                    await auth.logout();
                    toast("success", "Logged out");
                    router.replace("/(auth)/sign-in");
                  }}
                />
                <Pressable
                  onPress={() =>
                    toast("info", "Coming soon", "Profile editing can be added via PATCH /auth/me.")
                  }
                >
                  {({ pressed }) => (
                    <AppText
                      size={12}
                      color={theme.colors.muted}
                      style={{ textAlign: "center", opacity: pressed ? 0.7 : 1 }}
                    >
                      Edit profile (planned)
                    </AppText>
                  )}
                </Pressable>
              </VStack>
            </Card>
          </>
        )}
      </VStack>
    </Screen>
  );
}
