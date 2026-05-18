import FontAwesome from "@expo/vector-icons/FontAwesome";
import { forwardRef, useState } from "react";
import {
  Pressable,
  TextInput,
  View,
  type TextInput as TextInputType,
  type TextInputProps,
  type TextStyle,
} from "react-native";
import { theme } from "@/theme/theme";
import { AppText } from "./Primitives";

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoComplete?: TextInputProps["autoComplete"];
  textContentType?: TextInputProps["textContentType"];
  returnKeyType?: TextInputProps["returnKeyType"];
  onSubmitEditing?: TextInputProps["onSubmitEditing"];
  blurOnSubmit?: boolean;
  icon?: React.ComponentProps<typeof FontAwesome>["name"];
  hint?: string;
  editable?: boolean;
};

export const TextField = forwardRef<TextInputType, TextFieldProps>(function TextField(
  {
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType,
    autoCapitalize = "none",
    autoComplete,
    textContentType,
    returnKeyType,
    onSubmitEditing,
    blurOnSubmit = true,
    icon,
    hint,
    editable = true,
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const isPassword = Boolean(secureTextEntry);

  const inputStyle: TextStyle = {
    flex: 1,
    height: 48,
    color: theme.colors.text,
    fontFamily: theme.font.regular,
    fontSize: 15,
    paddingVertical: 0,
  };

  return (
    <View style={{ gap: 8 }}>
      <AppText size={12} weight="semibold" color={theme.colors.muted}>
        {label}
      </AppText>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          height: 52,
          borderRadius: theme.radii.lg,
          borderWidth: 1.5,
          borderColor: focused ? "rgba(255,122,24,0.55)" : theme.colors.border,
          backgroundColor: theme.colors.surface2,
          paddingHorizontal: theme.space[4],
          gap: 10,
          opacity: editable ? 1 : 0.6,
        }}
      >
        {icon ? (
          <FontAwesome
            name={icon}
            size={15}
            color={focused ? theme.colors.primary2 : theme.colors.muted}
          />
        ) : null}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(244,244,245,0.32)"
          secureTextEntry={isPassword && !revealed}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          autoComplete={autoComplete}
          textContentType={textContentType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={inputStyle}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setRevealed((v) => !v)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={revealed ? "Hide password" : "Show password"}
          >
            <FontAwesome
              name={revealed ? "eye-slash" : "eye"}
              size={16}
              color={theme.colors.muted}
            />
          </Pressable>
        ) : null}
      </View>
      {hint ? (
        <AppText size={11} color={theme.colors.muted}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
});
