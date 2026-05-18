import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ThemeProvider, type Theme } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useMemo } from "react";
import "react-native-reanimated";
import { QueryClientProvider } from "@tanstack/react-query";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { queryClient } from "@/lib/queryClient";
import { theme } from "@/theme/theme";
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
  const navTheme = useMemo<Theme>(
    () => ({
      dark: true,
      colors: {
        primary: theme.colors.primary,
        background: theme.colors.bg,
        card: theme.colors.surface,
        text: theme.colors.text,
        border: theme.colors.border,
        notification: theme.colors.primary2,
      },
      fonts: {
        regular: { fontFamily: theme.font.regular, fontWeight: "400" },
        medium: { fontFamily: theme.font.medium, fontWeight: "500" },
        bold: { fontFamily: theme.font.bold, fontWeight: "700" },
        heavy: { fontFamily: theme.font.bold, fontWeight: "700" },
      },
    }),
    []
  );

  return (
    <KeyboardProvider>
      <ThemeProvider value={navTheme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CartProvider>
              <Stack
                screenOptions={{
                  headerTintColor: theme.colors.text,
                  headerStyle: { backgroundColor: theme.colors.surface },
                }}
              >
                <Stack.Screen name="splash" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="product/[id]" options={{ title: "Product" }} />
                <Stack.Screen name="order/[id]" options={{ title: "Order" }} />
                <Stack.Screen name="+not-found" options={{ title: "Not found" }} />
              </Stack>
              <ToastHost />
            </CartProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </KeyboardProvider>
  );
}
