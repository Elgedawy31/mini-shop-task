import { ActivityIndicator, Pressable, Text, View, type ViewStyle } from "react-native";
import { theme } from "@/theme/theme";

export function Screen({
  children,
  padded = true,
}: {
  children: React.ReactNode;
  padded?: boolean;
}) {
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ flex: 1, padding: padded ? theme.space[4] : 0 }}>{children}</View>
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.xl,
          borderWidth: 1,
          borderColor: theme.colors.border,
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
  color = theme.colors.text,
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
      style={[{ color, fontSize: size, fontFamily: family }, style]}
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
  const colors =
    tone === "success"
      ? { bg: "rgba(34,197,94,0.14)", fg: "#7CF7A6" }
      : tone === "warning"
        ? { bg: "rgba(245,158,11,0.14)", fg: "#F8D08A" }
        : tone === "danger"
          ? { bg: "rgba(239,68,68,0.14)", fg: "#FFB4B4" }
          : tone === "info"
            ? { bg: "rgba(96,165,250,0.14)", fg: "#A7D0FF" }
            : { bg: "rgba(255,255,255,0.06)", fg: theme.colors.muted };

  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: colors.bg,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <AppText size={12} weight="medium" color={colors.fg}>
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
  const isDisabled = Boolean(disabled || loading);
  const bg =
    variant === "primary"
      ? theme.colors.primary
      : variant === "secondary"
        ? theme.colors.surface2
        : "transparent";
  const borderColor = variant === "ghost" ? "transparent" : theme.colors.border;
  const textColor = variant === "primary" ? "#FFF7ED" : theme.colors.text;

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
