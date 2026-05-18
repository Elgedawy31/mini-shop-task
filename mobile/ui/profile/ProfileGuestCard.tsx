import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Animated, { FadeInDown } from "react-native-reanimated";

import { theme } from "@/theme/theme";
import { AppText } from "@/ui/Primitives";
import { AnimatedPressable } from "@/ui/form/AnimatedPressable";

export function ProfileGuestCard() {
  return (
    <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.wrap}>
      <View style={styles.iconRing}>
        <FontAwesome name="user-circle" size={32} color={theme.colors.primary2} />
      </View>
      <View style={styles.copy}>
        <AppText size={18} weight="bold" style={{ textAlign: "center" }}>
          Sign in to your account
        </AppText>
        <AppText
          size={13}
          color={theme.colors.muted}
          style={{ textAlign: "center", lineHeight: 20 }}
        >
          Manage your profile, save preferences, and track orders across devices.
        </AppText>
      </View>
      <AnimatedPressable onPress={() => router.replace("/(auth)/sign-in")} style={styles.cta}>
        <AppText size={14} weight="semibold" color="#FFF7ED">
          Sign in
        </AppText>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    padding: theme.space[6],
    gap: theme.space[4],
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,122,24,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,122,24,0.28)",
  },
  copy: {
    gap: theme.space[2],
    maxWidth: 280,
  },
  cta: {
    paddingHorizontal: theme.space[6],
    paddingVertical: 14,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: "rgba(255,122,24,0.35)",
  },
});
