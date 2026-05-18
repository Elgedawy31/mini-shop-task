import type { ComponentProps } from "react";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "@/theme/theme";

export type ToastKind = "success" | "error" | "info";
export type ToastMessage = { id: string; kind: ToastKind; title: string; message?: string };

let pushToast: ((toast: Omit<ToastMessage, "id">) => void) | null = null;

export function toast(kind: ToastKind, title: string, message?: string) {
  pushToast?.({ kind, title, message });
}

const TOAST_ICONS: Record<ToastKind, ComponentProps<typeof FontAwesome>["name"]> = {
  success: "check-circle",
  error: "exclamation-circle",
  info: "info-circle",
};

function ToastCard({ item, onDismiss }: { item: ToastMessage; onDismiss: () => void }) {
  const accent =
    item.kind === "success"
      ? theme.colors.success
      : item.kind === "error"
        ? theme.colors.danger
        : theme.colors.info;

  useEffect(() => {
    const timer = setTimeout(onDismiss, 2600);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(18).stiffness(220)}
      exiting={FadeOutUp.duration(240)}
      style={styles.card}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${accent}22` }]}>
        <FontAwesome name={TOAST_ICONS[item.kind]} size={16} color={accent} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        {item.message ? (
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

export function ToastHost() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<ToastMessage[]>([]);

  useMemo(() => {
    pushToast = (toastInput) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setItems((prev) => [...prev, { id, ...toastInput }].slice(-3));
    };
    return null;
  }, []);

  if (items.length === 0) return null;

  return (
    <View pointerEvents="box-none" style={[styles.host, { top: insets.top + theme.space[2] }]}>
      {items.map((item) => (
        <ToastCard
          key={item.id}
          item={item}
          onDismiss={() => setItems((prev) => prev.filter((t) => t.id !== item.id))}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    left: theme.space[4],
    right: theme.space[4],
    zIndex: 100,
    gap: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[4],
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.font.semibold,
    fontSize: 14,
  },
  message: {
    color: theme.colors.muted,
    fontFamily: theme.font.regular,
    fontSize: 12,
  },
});
