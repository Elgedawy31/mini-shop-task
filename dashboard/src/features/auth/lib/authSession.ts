import Cookies from "js-cookie";
import { API_CONFIG } from "@/shared/config/api";
import type { AuthUser } from "@/shared/types/api";

const REFRESH_TOKEN_KEY = "refreshToken";
const EXPIRES_AT_KEY = "authExpiresAt";

export type StoredSession = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  user?: AuthUser;
};

function readUser(): AuthUser | undefined {
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as AuthUser) : undefined;
  } catch {
    return undefined;
  }
}

export const authSession = {
  getAccessToken(): string | null {
    return (
      localStorage.getItem(API_CONFIG.AUTH_TOKEN_KEY) ||
      Cookies.get(API_CONFIG.AUTH_TOKEN_KEY) ||
      null
    );
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getExpiresAt(): number | null {
    const raw = localStorage.getItem(EXPIRES_AT_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  },

  isAuthenticated(): boolean {
    return Boolean(this.getAccessToken());
  },

  isAccessTokenExpired(bufferSeconds = 60): boolean {
    const expiresAt = this.getExpiresAt();
    if (!expiresAt) return false;
    return Date.now() >= expiresAt - bufferSeconds * 1000;
  },

  load(): StoredSession | null {
    const accessToken = this.getAccessToken();
    if (!accessToken) return null;

    return {
      accessToken,
      refreshToken: this.getRefreshToken() ?? undefined,
      expiresAt: this.getExpiresAt() ?? undefined,
      user: readUser(),
    };
  },

  save(session: {
    token: string;
    refreshToken?: string;
    expiresIn?: number;
    user?: AuthUser;
  }): void {
    localStorage.setItem(API_CONFIG.AUTH_TOKEN_KEY, session.token);
    Cookies.set(API_CONFIG.AUTH_TOKEN_KEY, session.token, {
      expires: 7,
      sameSite: "lax",
    });

    if (session.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    }

    if (session.expiresIn) {
      const expiresAt = Date.now() + session.expiresIn * 1000;
      localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
    }

    if (session.user) {
      localStorage.setItem("user", JSON.stringify(session.user));
    }
  },

  clear(): void {
    localStorage.removeItem(API_CONFIG.AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
    localStorage.removeItem("user");
    Cookies.remove(API_CONFIG.AUTH_TOKEN_KEY);
  },
};
