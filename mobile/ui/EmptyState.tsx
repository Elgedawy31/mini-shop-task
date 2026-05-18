import { Pressable, View } from "react-native";

import { useAppTheme } from "@/theme/ThemeContext";
import { theme } from "@/theme/theme";
import { AppText, VStack } from "./Primitives";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        borderRadius: theme.radii.xl,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        padding: theme.space[5],
      }}
    >
      <VStack gap={8}>
        <AppText size={16} weight="semibold">
          {title}
        </AppText>
        {description ? (
          <AppText size={13} color={colors.muted}>
            {description}
          </AppText>
        ) : null}
        {actionLabel && onAction ? (
          <Pressable
            onPress={onAction}
            style={({ pressed }) => ({
              marginTop: theme.space[2],
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: theme.radii.lg,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface2,
              opacity: pressed ? 0.92 : 1,
              alignSelf: "flex-start",
            })}
          >
            <AppText weight="semibold">{actionLabel}</AppText>
          </Pressable>
        ) : null}
      </VStack>
    </View>
  );
}
