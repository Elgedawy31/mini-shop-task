import { apiClient } from "@/shared/services/apiClient";
import { API_CONFIG } from "@/shared/config/api";
import { unwrapResponse } from "@/shared/lib/apiResponse";
import type { ApiResponse, AuthPayload, AuthUser } from "@/shared/types/api";
import logger from "@/shared/utils/logger";
import Cookies from "js-cookie";

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
  const unwrapped = unwrapResponse<AuthPayload>(raw);

  if (!unwrapped.success) {
    return {
      success: false,
      error: unwrapped.error ?? unwrapped.message ?? "Request failed",
      message: unwrapped.message,
      errors: unwrapped.errors,
    };
  }

  const token =
    (unwrapped.token as string | undefined) ?? (unwrapped.data as AuthPayload | undefined)?.token;
  const user = mapUser(
    (unwrapped.user as AuthUser | undefined) ?? (unwrapped.data as AuthPayload | undefined)?.user
  );

  return {
    success: true,
    token,
    user,
    refreshToken: unwrapped.refreshToken as string | undefined,
    expiresIn: unwrapped.expiresIn as number | undefined,
    message: unwrapped.message as string | undefined,
  };
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

    if (result.success && result.token) {
      this.setAuthToken(result.token);
      if (result.user) this.setUserData(result.user);
    }

    if (!result.success) {
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

    if (result.success && result.token) {
      this.setAuthToken(result.token);
      if (result.user) this.setUserData(result.user);
    }

    if (!result.success) {
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

    if (result.success && result.token) {
      this.setAuthToken(result.token);
      if (result.user) this.setUserData(result.user);
    }

    if (!result.success) {
      logger.error("Registration failed:", result.error ?? result.message);
    }

    return result;
  }

  static async updateUser(_id: string, data: UpdateUserRequest): Promise<UpdateUserResponse> {
    const response = await apiClient.patch<AuthPayload>(API_CONFIG.ENDPOINTS.AUTH.ME, data);
    const result = toAuthResult(response as ApiResponse<AuthPayload> & Record<string, unknown>);

    if (result.success && result.user) {
      this.setUserData(result.user);
    }

    return result;
  }

  static async verifyUser(): Promise<AuthResult> {
    const token = this.getAuthToken();

    if (!token) {
      return { success: false, error: "No authentication token found" };
    }

    const response = await apiClient.get<AuthPayload>(API_CONFIG.ENDPOINTS.AUTH.ME);
    const result = toAuthResult(response as ApiResponse<AuthPayload> & Record<string, unknown>);

    if (result.success && result.user) {
      this.setUserData(result.user);
      return result;
    }

    this.clearAuthData();
    return {
      success: false,
      error: result.error ?? result.message ?? "Token verification failed",
    };
  }

  static isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  static getAuthToken(): string | null {
    return Cookies.get(API_CONFIG.AUTH_TOKEN_KEY) || null;
  }

  static setAuthToken(token: string): void {
    Cookies.set(API_CONFIG.AUTH_TOKEN_KEY, token, { expires: 7 });
  }

  static getUserData(): User | null {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  static setUserData(user: User): void {
    localStorage.setItem("user", JSON.stringify(user));
  }

  static clearAuthData(): void {
    Cookies.remove(API_CONFIG.AUTH_TOKEN_KEY);
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
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
