import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";
import { theme } from "@/theme/theme";

export type ToastKind = "success" | "error" | "info";
export type ToastMessage = { id: string; kind: ToastKind; title: string; message?: string };

let pushToast: ((toast: Omit<ToastMessage, "id">) => void) | null = null;

export function toast(kind: ToastKind, title: string, message?: string) {
  pushToast?.({ kind, title, message });
}

export function ToastHost() {
  const [items, setItems] = useState<ToastMessage[]>([]);
  const anim = useRef(new Animated.Value(0)).current;

  const api = useMemo(() => {
    pushToast = (toastInput) => {
      const id = String(Date.now()) + Math.random().toString(16).slice(2);
      setItems((prev) => [...prev, { id, ...toastInput }].slice(-2));
    };
    return null;
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    anim.setValue(0);
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 180 }).start(
      () => {
        const t = setTimeout(() => {
          Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
            setItems((prev) => prev.slice(1));
          });
        }, 2200);
        return () => clearTimeout(t);
      }
    );
  }, [anim, items]);

  if (items.length === 0) return null;
  const current = items[0];
  const accent =
    current.kind === "success"
      ? theme.colors.success
      : current.kind === "error"
        ? theme.colors.danger
        : theme.colors.info;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: theme.space[4],
        right: theme.space[4],
        top: theme.space[6],
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [-18, 0],
            }),
          },
        ],
        opacity: anim,
      }}
    >
      <View
        style={{
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
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              backgroundColor: accent,
            }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: theme.colors.text,
                fontFamily: theme.font.semibold,
                fontSize: 14,
              }}
              numberOfLines={1}
            >
              {current.title}
            </Text>
            {current.message ? (
              <Text
                style={{
                  color: theme.colors.muted,
                  fontFamily: theme.font.regular,
                  fontSize: 12,
                  marginTop: 2,
                }}
                numberOfLines={2}
              >
                {current.message}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
