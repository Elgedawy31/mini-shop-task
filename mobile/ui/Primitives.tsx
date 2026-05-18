import { ActivityIndicator, Pressable, Text, View, type ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { useAppTheme } from "@/theme/ThemeContext";
import { theme } from "@/theme/theme";

export function Screen({
  children,
  padded = true,
  edges = ["top", "left", "right"],
}: {
  children: React.ReactNode;
  padded?: boolean;
  edges?: Edge[];
}) {
  const { colors } = useAppTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={edges}>
        <View style={{ flex: 1, padding: padded ? theme.space[4] : 0 }}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: theme.radii.xl,
          borderWidth: 1,
          borderColor: colors.border,
          padding: theme.space[4],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function HStack({
  children,
  gap = 12,
  align = "center",
  justify = "flex-start",
  style,
}: {
  children: React.ReactNode;
  gap?: number;
  align?: ViewStyle["alignItems"];
  justify?: ViewStyle["justifyContent"];
  style?: ViewStyle;
}) {
  return (
    <View
      style={[{ flexDirection: "row", alignItems: align, justifyContent: justify, gap }, style]}
    >
      {children}
    </View>
  );
}

export function VStack({
  children,
  gap = 12,
  style,
}: {
  children: React.ReactNode;
  gap?: number;
  style?: ViewStyle;
}) {
  return <View style={[{ gap }, style]}>{children}</View>;
}

export function AppText({
  children,
  color,
  size = 14,
  weight = "regular",
  style,
  numberOfLines,
}: {
  children: React.ReactNode;
  color?: string;
  size?: number;
  weight?: "regular" | "medium" | "semibold" | "bold";
  style?: any;
  numberOfLines?: number;
}) {
  const { colors } = useAppTheme();
  const resolvedColor = color ?? colors.text;
  const family =
    weight === "bold"
      ? theme.font.bold
      : weight === "semibold"
        ? theme.font.semibold
        : weight === "medium"
          ? theme.font.medium
          : theme.font.regular;

  return (
    <Text
      style={[{ color: resolvedColor, fontSize: size, fontFamily: family }, style]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

export function Badge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const { colors, isDark } = useAppTheme();

  const toneColors =
    tone === "success"
      ? { bg: "rgba(34,197,94,0.14)", fg: isDark ? "#7CF7A6" : "#15803D" }
      : tone === "warning"
        ? { bg: "rgba(245,158,11,0.14)", fg: isDark ? "#F8D08A" : "#B45309" }
        : tone === "danger"
          ? { bg: "rgba(239,68,68,0.14)", fg: isDark ? "#FFB4B4" : "#B91C1C" }
          : tone === "info"
            ? { bg: "rgba(96,165,250,0.14)", fg: isDark ? "#A7D0FF" : "#1D4ED8" }
            : { bg: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", fg: colors.muted };

  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: toneColors.bg,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <AppText size={12} weight="medium" color={toneColors.fg}>
        {label}
      </AppText>
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
  left,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  left?: React.ReactNode;
}) {
  const { colors } = useAppTheme();
  const isDisabled = Boolean(disabled || loading);
  const bg =
    variant === "primary"
      ? colors.primary
      : variant === "secondary"
        ? colors.surface2
        : "transparent";
  const borderColor = variant === "ghost" ? "transparent" : colors.border;
  const textColor = variant === "primary" ? "#FFF7ED" : colors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          height: 48,
          borderRadius: theme.radii.lg,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor,
          paddingHorizontal: theme.space[4],
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          opacity: isDisabled ? 0.55 : pressed ? 0.92 : 1,
        },
      ]}
    >
      {loading ? <ActivityIndicator color={textColor} /> : left}
      <AppText size={14} weight="semibold" color={textColor}>
        {label}
      </AppText>
    </Pressable>
  );
}
