import Constants from "expo-constants";
import { Platform } from "react-native";

const API_PORT = 5001;

function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

/** Host from Metro / Expo Go (e.g. 192.168.1.71:8081 → 192.168.1.71). */
function hostFromExpoDevServer(): string | null {
  const candidates = [
    Constants.expoGoConfig?.debuggerHost,
    Constants.expoConfig?.hostUri,
    Constants.linkingUri,
  ].filter((value): value is string => Boolean(value));

  for (const raw of candidates) {
    const withoutProtocol = raw.replace(/^https?:\/\//, "");
    const host = withoutProtocol.split(":")[0]?.trim();
    if (!host) continue;

    if (host === "localhost" || host === "127.0.0.1") {
      return Platform.OS === "android" ? "10.0.2.2" : "localhost";
    }

    return host;
  }

  return null;
}

function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (fromEnv) return trimTrailingSlash(fromEnv);

  if (__DEV__) {
    const host = hostFromExpoDevServer();
    if (host) return `http://${host}:${API_PORT}`;
  }

  if (Platform.OS === "android") {
    return `http://10.0.2.2:${API_PORT}`;
  }

  return `http://localhost:${API_PORT}`;
}

export const env = {
  apiBaseUrl: resolveApiBaseUrl(),
} as const;

if (__DEV__) {
  console.info(`[Mini Shop] API base URL: ${env.apiBaseUrl}`);
}
