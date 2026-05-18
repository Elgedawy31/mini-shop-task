import axios from "axios";
import { API_CONFIG } from "@/shared/config/api";
import { parseAuthPayload } from "./parseAuthPayload";
import { authSession } from "./authSession";
import type { ApiResponse, AuthPayload } from "@/shared/types/api";

let refreshPromise: Promise<string | null> | null = null;

/** Refresh access token via backend; dedupes concurrent requests */
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = authSession.getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const { data } = await axios.post<ApiResponse<AuthPayload> & Record<string, unknown>>(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`,
        { refreshToken },
        {
          headers: API_CONFIG.HEADERS.DEFAULT,
          timeout: API_CONFIG.TIMEOUT,
        }
      );

      const parsed = parseAuthPayload(data);
      if (!parsed) {
        return null;
      }

      authSession.save({
        token: parsed.token,
        refreshToken: parsed.refreshToken ?? refreshToken,
        expiresIn: parsed.expiresIn,
        user: parsed.user,
      });

      return parsed.token;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
