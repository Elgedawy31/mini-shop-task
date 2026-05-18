import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Animated, { FadeInDown } from "react-native-reanimated";

import { api } from "@/features/api";
import { useAuth } from "@/features/auth/AuthContext";
import type { AuthUser } from "@/lib/api/types";
import { theme } from "@/theme/theme";
import { AppText, Button, Card, Screen, VStack } from "@/ui/Primitives";
import { Skeleton } from "@/ui/Skeleton";
import { toast } from "@/ui/Toast";
import { ProfileEditForm } from "@/ui/profile/ProfileEditForm";
import { ProfileGuestCard } from "@/ui/profile/ProfileGuestCard";
import { ThemeModeToggle } from "@/ui/profile/ThemeModeToggle";

function ProfileHero({ user }: { user: AuthUser }) {
  const initial = user.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <Animated.View entering={FadeInDown.duration(380).springify()}>
      <Card style={styles.hero}>
        <View style={styles.avatar}>
          <AppText size={22} weight="bold" color="#FFF7ED">
            {initial}
          </AppText>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <AppText size={18} weight="bold">
            {user.name}
          </AppText>
          <AppText size={13} color={theme.colors.muted}>
            {user.email}
          </AppText>
          <View style={styles.rolePill}>
            <FontAwesome name="shield" size={10} color={theme.colors.primary2} />
            <AppText size={11} weight="medium" color={theme.colors.primary2}>
              {user.role}
            </AppText>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

export default function Profile() {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<AuthUser | undefined>(auth.session?.user);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!auth.session?.token) {
        setProfile(undefined);
        return;
      }
      setLoading(true);
      const res = await api.auth.me();
      if (cancelled) return;
      setLoading(false);
      if (res.success) {
        setProfile(res.data.user);
        await auth.updateUser(res.data.user);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth.session?.token, auth.updateUser]);

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <AppText size={22} weight="bold">
            Profile
          </AppText>
          <AppText size={12} color={theme.colors.muted}>
            Manage your account and app preferences.
          </AppText>
        </View>

        <ThemeModeToggle />

        {!auth.session?.token ? (
          <ProfileGuestCard />
        ) : loading && !profile ? (
          <VStack gap={12}>
            <Skeleton height={100} style={{ borderRadius: theme.radii.xl }} />
            <Skeleton height={320} style={{ borderRadius: theme.radii.xl }} />
          </VStack>
        ) : profile ? (
          <VStack gap={14}>
            <ProfileHero user={profile} />
            <ProfileEditForm user={profile} onUpdated={setProfile} />
            <Card>
              <VStack gap={12}>
                <AppText size={14} weight="semibold">
                  Session
                </AppText>
                <Button
                  variant="secondary"
                  label="Log out"
                  onPress={async () => {
                    await auth.logout();
                    toast("success", "Logged out");
                    router.replace("/(auth)/sign-in");
                  }}
                />
              </VStack>
            </Card>
          </VStack>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: theme.space[4],
    paddingBottom: theme.space[8],
    gap: 14,
  },
  header: {
    gap: 4,
    marginBottom: 4,
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
    padding: theme.space[4],
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: "rgba(255,122,24,0.4)",
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,122,24,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,122,24,0.25)",
  },
});
