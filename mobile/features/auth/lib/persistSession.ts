import type { AuthSessionPayload } from "@/lib/api/types";
import { sessionStore } from "@/features/auth/session";

export function toStoredSession(data: AuthSessionPayload) {
  return {
    token: data.token,
    refreshToken: data.refreshToken,
    expiresAt: data.expiresIn ? Date.now() + data.expiresIn * 1000 : undefined,
    user: data.user,
  };
}

export async function persistAuthSession(data: AuthSessionPayload) {
  await sessionStore.save(data);
  return toStoredSession(data);
}
