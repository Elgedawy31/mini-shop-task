import { unwrapResponse } from "@/shared/lib/apiResponse";
import type { ApiResponse, AuthPayload, AuthUser } from "@/shared/types/api";

export type ParsedAuthSession = {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: AuthUser;
};

/** Extract token, refreshToken, user from any backend auth envelope */
export function parseAuthPayload(
  raw: ApiResponse<AuthPayload> & Record<string, unknown>
): ParsedAuthSession | null {
  const unwrapped = unwrapResponse<AuthPayload>(raw);

  if (unwrapped.success === false) {
    return null;
  }

  const nested = unwrapped.data as AuthPayload | undefined;

  const token =
    (unwrapped.token as string | undefined) ??
    nested?.token ??
    ((nested as Record<string, unknown> | undefined)?.access_token as string | undefined);

  if (!token) {
    return null;
  }

  const user =
    (unwrapped.user as AuthUser | undefined) ??
    nested?.user ??
    ((nested as Record<string, unknown> | undefined)?.user as AuthUser | undefined);

  const refreshToken =
    (unwrapped.refreshToken as string | undefined) ??
    nested?.refreshToken ??
    ((nested as Record<string, unknown> | undefined)?.refresh_token as string | undefined);

  const expiresIn =
    (unwrapped.expiresIn as number | undefined) ??
    nested?.expiresIn ??
    ((nested as Record<string, unknown> | undefined)?.expires_in as number | undefined);

  return { token, refreshToken, expiresIn, user };
}
