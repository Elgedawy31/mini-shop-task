import { useEffect, useMemo, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { theme } from "@/theme/theme";
import { LogoMark } from "@/ui/LogoMark";
import { AppText } from "@/ui/Primitives";
import { useAuth } from "@/features/auth/AuthContext";
import { sessionStore } from "@/features/auth/session";
import { apiClient } from "@/lib/api/client";
import type { AuthSessionPayload } from "@/lib/api/types";

const { width } = Dimensions.get("window");

function isExpired(expiresAt?: number) {
  if (!expiresAt) return false;
  return Date.now() >= expiresAt - 60_000;
}

export default function Splash() {
  const { session, isHydrating, refreshFromStore, setSession } = useAuth();
  const [canRoute, setCanRoute] = useState(false);

  const progress = useSharedValue(0);
  const cards = [useSharedValue(0), useSharedValue(0), useSharedValue(0)];

  useEffect(() => {
    progress.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
    cards[0].value = withDelay(60, withSpring(1, { damping: 14, stiffness: 140 }));
    cards[1].value = withDelay(140, withSpring(1, { damping: 14, stiffness: 140 }));
    cards[2].value = withDelay(220, withSpring(1, { damping: 14, stiffness: 140 }));

    const t = setTimeout(() => setCanRoute(true), 1500);
    return () => clearTimeout(t);
  }, [cards, progress]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isHydrating) return;

      // If token looks expired, try a refresh once (silent).
      const stored = await sessionStore.load();
      if (stored?.token && isExpired(stored.expiresAt) && stored.refreshToken) {
        const refreshed = await apiClient.post<AuthSessionPayload>("/auth/refresh", {
          refreshToken: stored.refreshToken,
        });
        if (refreshed.success) {
          await sessionStore.save(refreshed.data);
          await refreshFromStore();
        } else {
          await sessionStore.clear();
          setSession(null);
        }
      }

      if (cancelled) return;
    })();

    return () => {
      cancelled = true;
    };
  }, [isHydrating, refreshFromStore, setSession]);

  useEffect(() => {
    if (!canRoute || isHydrating) return;

    if (session?.token) {
      router.replace("/(tabs)/shop");
    } else {
      router.replace("/(auth)/sign-in");
    }
  }, [canRoute, isHydrating, session?.token]);

  const logoStyle = useAnimatedStyle(() => {
    const s = interpolate(progress.value, [0, 1], [0.86, 1]);
    const y = interpolate(progress.value, [0, 1], [18, 0]);
    return {
      transform: [{ translateY: y }, { scale: s }],
      opacity: interpolate(progress.value, [0, 1], [0, 1]),
    };
  });

  const makeCardStyle = (idx: number) =>
    useAnimatedStyle(() => {
      const v = cards[idx].value;
      const baseY = idx === 0 ? 26 : idx === 1 ? -6 : -34;
      const baseX = idx === 0 ? -18 : idx === 1 ? 12 : -6;
      const rot = idx === 0 ? -10 : idx === 1 ? 12 : -6;
      return {
        opacity: v,
        transform: [
          { translateX: baseX * (1 - v) },
          { translateY: baseY * (1 - v) },
          { rotate: `${rot * (1 - v)}deg` },
          { scale: 0.94 + 0.06 * v },
        ],
      };
    });

  const card0 = makeCardStyle(0);
  const card1 = makeCardStyle(1);
  const card2 = makeCardStyle(2);

  const heroW = Math.min(360, width - theme.space[8]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#060607", "#0B0B0D", "#140B06"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: theme.space[6] }}
      >
        <View style={{ width: heroW, height: 240, justifyContent: "center", alignItems: "center" }}>
          <Animated.View style={[styles.card, styles.cardBack, card0]} />
          <Animated.View style={[styles.card, styles.cardMid, card1]} />
          <Animated.View style={[styles.card, styles.cardFront, card2]} />

          <Animated.View style={[styles.logoWrap, logoStyle]}>
            <LogoMark size={54} />
          </Animated.View>
        </View>

        <Animated.View
          entering={FadeIn.duration(320).delay(220)}
          exiting={FadeOut.duration(120)}
          style={{ alignItems: "center" }}
        >
          <AppText size={18} weight="bold">
            Mini Shop
          </AppText>
          <AppText size={12} color={theme.colors.muted} style={{ marginTop: 6 }}>
            Shop fast. Track orders. Stay in control.
          </AppText>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    position: "absolute",
    width: 220,
    height: 140,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardBack: {
    backgroundColor: "rgba(255,255,255,0.06)",
    transform: [{ rotate: "-10deg" }, { translateX: -22 }, { translateY: 18 }],
  },
  cardMid: {
    backgroundColor: "rgba(255,122,24,0.12)",
    transform: [{ rotate: "10deg" }, { translateX: 14 }, { translateY: 0 }],
  },
  cardFront: {
    backgroundColor: "rgba(187,77,0,0.18)",
    transform: [{ rotate: "-4deg" }, { translateX: -4 }, { translateY: -18 }],
  },
});
