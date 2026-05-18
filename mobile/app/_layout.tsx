import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ThemeProvider, type Theme } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useMemo } from "react";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { QueryClientProvider } from "@tanstack/react-query";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { queryClient } from "@/lib/queryClient";
import { theme } from "@/theme/theme";
import { AppThemeProvider, useAppTheme } from "@/theme/ThemeContext";
import { AuthProvider } from "@/features/auth/AuthContext";
import { CartProvider } from "@/features/cart/CartContext";
import { ToastHost } from "@/ui/Toast";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "splash",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <AppThemeProvider>
          <ThemedNavigation />
        </AppThemeProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}

function ThemedNavigation() {
  const { colors, isDark } = useAppTheme();

  const navTheme = useMemo<Theme>(
    () => ({
      dark: isDark,
      colors: {
        primary: colors.primary,
        background: colors.bg,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.primary2,
      },
      fonts: {
        regular: { fontFamily: theme.font.regular, fontWeight: "400" },
        medium: { fontFamily: theme.font.medium, fontWeight: "500" },
        bold: { fontFamily: theme.font.bold, fontWeight: "700" },
        heavy: { fontFamily: theme.font.bold, fontWeight: "700" },
      },
    }),
    [colors, isDark]
  );

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <Stack
              screenOptions={{
                headerTintColor: colors.text,
                headerStyle: { backgroundColor: colors.surface },
                headerTitleStyle: {
                  fontFamily: theme.font.semibold,
                  fontSize: 16,
                },
                headerShadowVisible: false,
                contentStyle: { backgroundColor: colors.bg },
              }}
            >
              <Stack.Screen name="splash" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="order/[id]" options={{ title: "Order" }} />
              <Stack.Screen name="+not-found" options={{ title: "Not found" }} />
            </Stack>
            <ToastHost />
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
