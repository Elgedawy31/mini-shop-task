import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import {
  KeyboardAwareScrollView,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { theme } from "@/theme/theme";
import { useAuthScrollMotion } from "@/ui/hooks/useAuthScrollMotion";
import { LogoMark } from "@/ui/LogoMark";
import { AppText } from "@/ui/Primitives";

type AuthScreenProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showBack?: boolean;
  badge?: string;
};

export function AuthScreen({
  title,
  subtitle,
  children,
  footer,
  showBack = false,
  badge,
}: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();

  const {
    scrollHandler,
    glowPrimaryStyle,
    glowSecondaryStyle,
    brandStyle,
    headerStyle,
    cardStyle,
    footerStyle,
    progressStyle,
  } = useAuthScrollMotion(keyboardHeight);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#060607", "#0B0B0D", "#140B06"]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.progressTrack} pointerEvents="none">
        <Animated.View style={[styles.progressBar, progressStyle]} />
      </View>

      <AuthGlow style={styles.glowPrimary} motionStyle={glowPrimaryStyle} />
      <AuthGlow style={styles.glowSecondary} delay={600} motionStyle={glowSecondaryStyle} />

      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + theme.space[3],
            paddingBottom: insets.bottom + theme.space[6],
          },
        ]}
        bottomOffset={insets.bottom + theme.space[5]}
        extraKeyboardSpace={theme.space[6]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        bounces
      >
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <FontAwesome name="chevron-left" size={14} color={theme.colors.text} />
            <AppText size={13} weight="medium">
              Back
            </AppText>
          </Pressable>
        ) : null}

        <Animated.View style={brandStyle}>
          <View style={styles.brandRow}>
            <LogoMark size={48} />
            <View style={styles.brandText}>
              <AppText size={11} weight="semibold" color={theme.colors.primary2}>
                MINI SHOP
              </AppText>
              <AppText size={13} color={theme.colors.muted}>
                Premium storefront
              </AppText>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.header, headerStyle]}>
          {badge ? (
            <View style={styles.badge}>
              <AppText size={11} weight="semibold" color={theme.colors.primary2}>
                {badge}
              </AppText>
            </View>
          ) : null}
          <AppText size={28} weight="bold" style={styles.title}>
            {title}
          </AppText>
          <AppText size={14} color={theme.colors.muted} style={styles.subtitle}>
            {subtitle}
          </AppText>
        </Animated.View>

        <Animated.View style={cardStyle}>
          <AuthFormCard>{children}</AuthFormCard>
        </Animated.View>

        {footer ? (
          <Animated.View style={[styles.footer, footerStyle]}>{footer}</Animated.View>
        ) : null}
      </KeyboardAwareScrollView>
    </View>
  );
}

export function AuthFormCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHighlight} />
      {children}
    </View>
  );
}

export function AuthLinkRow({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.linkRow, style]}>{children}</View>;
}

export function AuthLink({
  label,
  onPress,
  accent = false,
}: {
  label: string;
  onPress: () => void;
  accent?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}>
      <AppText
        size={13}
        weight="semibold"
        color={accent ? theme.colors.primary2 : theme.colors.muted}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function AuthGlow({
  style,
  delay = 0,
  motionStyle,
}: {
  style: ViewStyle;
  delay?: number;
  motionStyle: object;
}) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      pulse.value = withRepeat(
        withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
    }, delay);
    return () => clearTimeout(timeout);
  }, [pulse, delay]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.32 + pulse.value * 0.18,
    transform: [{ scale: 0.92 + pulse.value * 0.12 }],
  }));

  return (
    <Animated.View style={[style, motionStyle]} pointerEvents="none">
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { borderRadius: 999, backgroundColor: style.backgroundColor },
          pulseStyle,
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  flex: {
    flex: 1,
  },
  progressTrack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    zIndex: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  progressBar: {
    height: 2,
    backgroundColor: theme.colors.primary2,
    borderRadius: 999,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.space[5],
    gap: theme.space[4],
  },
  glowPrimary: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    top: -60,
    right: -40,
    backgroundColor: "rgba(255,122,24,0.22)",
  },
  glowSecondary: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    bottom: 80,
    left: -80,
    backgroundColor: "rgba(187,77,0,0.18)",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
    marginTop: theme.space[1],
  },
  brandText: {
    gap: 2,
  },
  header: {
    gap: theme.space[2],
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,122,24,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,122,24,0.28)",
    marginBottom: 4,
  },
  title: {
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  subtitle: {
    lineHeight: 21,
    maxWidth: 320,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.space[5],
    gap: theme.space[4],
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  footer: {
    alignItems: "center",
    gap: theme.space[3],
    paddingTop: theme.space[2],
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: theme.space[2],
  },
});
