import * as SecureStore from "expo-secure-store";
import type { AuthSessionPayload, AuthUser } from "@/lib/api/types";

const KEY_TOKEN = "mini_shop_token";
const KEY_REFRESH = "mini_shop_refresh";
const KEY_EXPIRES_AT = "mini_shop_expires_at";
const KEY_USER = "mini_shop_user";

export type StoredSession = {
  token: string;
  refreshToken?: string;
  expiresAt?: number;
  user?: AuthUser;
};

async function getJson<T>(key: string): Promise<T | undefined> {
  const raw = await SecureStore.getItemAsync(key);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

async function setJson(key: string, value: unknown) {
  await SecureStore.setItemAsync(key, JSON.stringify(value));
}

export const sessionStore = {
  async load(): Promise<StoredSession | null> {
    const token = await SecureStore.getItemAsync(KEY_TOKEN);
    if (!token) return null;
    const refreshToken = (await SecureStore.getItemAsync(KEY_REFRESH)) ?? undefined;
    const expiresAtRaw = await SecureStore.getItemAsync(KEY_EXPIRES_AT);
    const expiresAt = expiresAtRaw ? Number(expiresAtRaw) : undefined;
    const user = await getJson<AuthUser>(KEY_USER);
    return { token, refreshToken, expiresAt, user };
  },

  async save(payload: AuthSessionPayload) {
    await SecureStore.setItemAsync(KEY_TOKEN, payload.token);
    if (payload.refreshToken) {
      await SecureStore.setItemAsync(KEY_REFRESH, payload.refreshToken);
    }
    if (payload.expiresIn) {
      const expiresAt = Date.now() + payload.expiresIn * 1000;
      await SecureStore.setItemAsync(KEY_EXPIRES_AT, String(expiresAt));
    }
    await setJson(KEY_USER, payload.user);
  },

  async updateUser(user: AuthUser) {
    await setJson(KEY_USER, user);
  },

  async clear() {
    await SecureStore.deleteItemAsync(KEY_TOKEN);
    await SecureStore.deleteItemAsync(KEY_REFRESH);
    await SecureStore.deleteItemAsync(KEY_EXPIRES_AT);
    await SecureStore.deleteItemAsync(KEY_USER);
  },
};
