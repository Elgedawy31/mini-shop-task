import FontAwesome from "@expo/vector-icons/FontAwesome";
import { forwardRef, useState } from "react";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import {
  Pressable,
  TextInput,
  View,
  type TextInput as TextInputType,
  type TextInputProps,
  type TextStyle,
} from "react-native";
import Animated from "react-native-reanimated";

import { theme } from "@/theme/theme";
import { AppText } from "@/ui/Primitives";
import { useShakeAnimation } from "@/ui/form/useShakeAnimation";

export type FormTextFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
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

export function FormTextField<T extends FieldValues>({
  control,
  name,
  label,
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
}: FormTextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value, ref }, fieldState: { error, isTouched } }) => (
        <FieldInput
          ref={ref}
          label={label}
          value={value ?? ""}
          onChangeText={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
          icon={icon}
          hint={hint}
          editable={editable}
          error={isTouched || error ? error?.message : undefined}
          shake={Boolean(error)}
        />
      )}
    />
  );
}

type FieldInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
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
  error?: string;
  shake?: boolean;
};

const FieldInput = forwardRef<TextInputType, FieldInputProps>(function FieldInput(
  {
    label,
    value,
    onChangeText,
    onBlur,
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
    error,
    shake = false,
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const shakeStyle = useShakeAnimation(shake);
  const isPassword = Boolean(secureTextEntry);
  const hasError = Boolean(error);

  const inputStyle: TextStyle = {
    flex: 1,
    height: 48,
    color: theme.colors.text,
    fontFamily: theme.font.regular,
    fontSize: 15,
    paddingVertical: 0,
  };

  const borderColor = hasError
    ? theme.colors.danger
    : focused
      ? "rgba(255,122,24,0.55)"
      : theme.colors.border;

  return (
    <Animated.View style={[{ gap: 8 }, shakeStyle]}>
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
          borderColor,
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
            color={
              hasError ? theme.colors.danger : focused ? theme.colors.primary2 : theme.colors.muted
            }
          />
        ) : null}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          onBlur={() => {
            setFocused(false);
            onBlur();
          }}
          onFocus={() => setFocused(true)}
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
      {error ? (
        <AppText size={11} color={theme.colors.danger}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText size={11} color={theme.colors.muted}>
          {hint}
        </AppText>
      ) : null}
    </Animated.View>
  );
});
