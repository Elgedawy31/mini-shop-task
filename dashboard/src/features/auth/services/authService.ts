import { apiClient } from "@/shared/services/apiClient";
import { API_CONFIG } from "@/shared/config/api";
import { unwrapResponse } from "@/shared/lib/apiResponse";
import type { ApiResponse, AuthPayload, AuthUser } from "@/shared/types/api";
import logger from "@/shared/utils/logger";
import { authSession } from "../lib/authSession";
import { parseAuthPayload } from "../lib/parseAuthPayload";

export type User = AuthUser & { _id?: string };

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface SetupAdminRequest {
  name: string;
  email: string;
  password: string;
}

export type SetupStatus = {
  needsSetup: boolean;
};

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  message?: string;
  error?: string;
  errors?: string[];
}

export interface UpdateUserRequest {
  email: string;
  password?: string;
  name?: string;
}

export type UpdateUserResponse = AuthResult;

function mapUser(user?: AuthUser): User | undefined {
  if (!user) return undefined;
  return {
    ...user,
    _id: user._id ?? user.id,
    id: user.id ?? user._id ?? "",
  };
}

function toAuthResult(raw: ApiResponse<AuthPayload> & Record<string, unknown>): AuthResult {
  const parsed = parseAuthPayload(raw);

  if (!parsed) {
    const unwrapped = unwrapResponse<AuthPayload>(raw);
    if (unwrapped.success === false) {
      return {
        success: false,
        error: unwrapped.error ?? unwrapped.message ?? "Request failed",
        message: unwrapped.message,
        errors: unwrapped.errors,
      };
    }

    return {
      success: false,
      error: "Invalid authentication response from server",
    };
  }

  const user = mapUser(parsed.user);

  return {
    success: true,
    token: parsed.token,
    user,
    refreshToken: parsed.refreshToken,
    expiresIn: parsed.expiresIn,
    message: (raw.message as string | undefined) ?? undefined,
  };
}

function persistSession(result: AuthResult): void {
  if (!result.token) return;

  authSession.save({
    token: result.token,
    refreshToken: result.refreshToken,
    expiresIn: result.expiresIn,
    user: result.user,
  });
}

export class AuthService {
  static async fetchSetupStatus(): Promise<SetupStatus> {
    const response = await apiClient.get<SetupStatus>(API_CONFIG.ENDPOINTS.AUTH.SETUP_STATUS);
    const unwrapped = unwrapResponse<SetupStatus>(
      response as ApiResponse<SetupStatus> & Record<string, unknown>
    );

    if (!unwrapped.success) {
      throw new Error(unwrapped.error ?? unwrapped.message ?? "Could not check setup status");
    }

    const payload = unwrapped.data as SetupStatus | undefined;
    const needsSetup =
      payload?.needsSetup ?? (unwrapped as unknown as SetupStatus).needsSetup ?? false;

    return { needsSetup: Boolean(needsSetup) };
  }

  static async setupFirstAdmin(payload: SetupAdminRequest): Promise<AuthResult> {
    const response = await apiClient.post<AuthPayload>(API_CONFIG.ENDPOINTS.AUTH.SETUP, payload);
    const result = toAuthResult(response as ApiResponse<AuthPayload> & Record<string, unknown>);

    if (result.success) {
      persistSession(result);
    } else {
      logger.error("Setup failed:", result.error ?? result.message);
    }

    return result;
  }

  static async login(credentials: LoginRequest): Promise<AuthResult> {
    const response = await apiClient.post<AuthPayload>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    const result = toAuthResult(response as ApiResponse<AuthPayload> & Record<string, unknown>);

    if (result.success) {
      persistSession(result);
    } else {
      logger.error("Login failed:", result.error ?? result.message);
    }

    return result;
  }

  static async register(credentials: RegisterRequest): Promise<AuthResult> {
    const response = await apiClient.post<AuthPayload>(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      credentials
    );

    const result = toAuthResult(response as ApiResponse<AuthPayload> & Record<string, unknown>);

    if (result.success) {
      persistSession(result);
    } else {
      logger.error("Registration failed:", result.error ?? result.message);
    }

    return result;
  }

  static async updateUser(_id: string, data: UpdateUserRequest): Promise<UpdateUserResponse> {
    const response = await apiClient.patch<AuthPayload>(API_CONFIG.ENDPOINTS.AUTH.ME, data);
    const result = toAuthResult(response as ApiResponse<AuthPayload> & Record<string, unknown>);

    if (result.success && result.user) {
      authSession.save({
        token: this.getAuthToken() ?? "",
        refreshToken: authSession.getRefreshToken() ?? undefined,
        user: result.user,
      });
    }

    return result;
  }

  static async verifyUser(): Promise<AuthResult> {
    const token = this.getAuthToken();

    if (!token) {
      return { success: false, error: "No authentication token found" };
    }

    const response = await apiClient.get<{ user: AuthUser }>(API_CONFIG.ENDPOINTS.AUTH.ME);
    const unwrapped = unwrapResponse<{ user: AuthUser }>(
      response as ApiResponse<{ user: AuthUser }> & Record<string, unknown>
    );

    if (unwrapped.success === false) {
      this.clearAuthData();
      return {
        success: false,
        error: unwrapped.error ?? unwrapped.message ?? "Token verification failed",
      };
    }

    const user = mapUser(
      (unwrapped.user as AuthUser | undefined) ??
        (unwrapped.data as { user?: AuthUser } | undefined)?.user
    );

    if (!user) {
      this.clearAuthData();
      return { success: false, error: "User profile not found" };
    }

    authSession.save({
      token,
      refreshToken: authSession.getRefreshToken() ?? undefined,
      user,
    });

    return { success: true, user, token };
  }

  static isAuthenticated(): boolean {
    return authSession.isAuthenticated();
  }

  static getAuthToken(): string | null {
    return authSession.getAccessToken();
  }

  static setAuthToken(token: string): void {
    authSession.save({ token });
  }

  static getUserData(): User | null {
    const session = authSession.load();
    if (!session?.user) return null;
    return mapUser(session.user) ?? null;
  }

  static setUserData(user: User): void {
    const token = this.getAuthToken();
    if (!token) return;
    authSession.save({
      token,
      refreshToken: authSession.getRefreshToken() ?? undefined,
      user,
    });
  }

  static clearAuthData(): void {
    authSession.clear();
  }

  static validateLoginData(data: LoginRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.email) {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push("Please enter a valid email address");
    }

    if (!data.password) {
      errors.push("Password is required");
    } else if (data.password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    return { isValid: errors.length === 0, errors };
  }

  static transformLoginFormData(formData: { email?: string; password?: string }): LoginRequest {
    return {
      email: formData.email?.trim().toLowerCase() ?? "",
      password: formData.password ?? "",
    };
  }
}

export const {
  login,
  updateUser,
  verifyUser,
  isAuthenticated,
  getAuthToken,
  setAuthToken,
  getUserData,
  setUserData,
  clearAuthData,
  validateLoginData,
  transformLoginFormData,
} = AuthService;
