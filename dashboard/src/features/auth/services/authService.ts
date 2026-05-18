import { apiClient } from "@/shared/hooks/useApi";
import { API_CONFIG } from "@/shared/config/api";
// import type { ApiResponse } from '@/shared/services/apiClient'
import Cookies from "js-cookie";

// Auth API response types
export interface User {
  _id: string;
  id: string;
  email: string;
  name?: string;
  role?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user?: User;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  message?: string;
  error?: string;
  errors?: string[];
  success: boolean;
}

export interface RegisterResponse {
  user?: User;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  message?: string;
  error?: string;
  errors?: string[];
  success: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface VerifyResponse {
  success: boolean;
  user?: User;
  message?: string;
  error?: string;
}

export interface LogoutResponse {
  message: string;
}

export interface UpdateUserRequest {
  email: string;
  password?: string;
}

export interface UpdateUserResponse {
  user?: User;
  message?: string;
  error?: string;
  errors?: string[];
  success: boolean;
}

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log("🚀 AuthService.login called with:", {
        email: credentials.email,
        timestamp: new Date().toISOString(),
      });

      const response = await apiClient.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      console.log("📡 AuthService.login API response received:", {
        response,
        timestamp: new Date().toISOString(),
      });

      // Handle the actual API response structure
      // The response might be directly the data or wrapped in response.data
      let loginData: LoginResponse;

      if (response.data) {
        // If response has a data property, use it
        loginData = response.data as LoginResponse;
      } else {
        // If response is directly the data, use it as is
        loginData = response as LoginResponse;
      }

      console.log("📦 Processed login data:", loginData);

      // If login is successful, store the token
      if (loginData.success) {
        if (loginData.token) {
          this.setAuthToken(loginData.token);
        }

        // Store user data if needed
        if (loginData.user) {
          this.setUserData(loginData.user);
        }

        return loginData;
      }

      return loginData;
    } catch (error) {
      console.error("❌ AuthService.login error:", error, { timestamp: new Date().toISOString() });
      throw error;
    }
  }

  static async register(credentials: RegisterRequest): Promise<RegisterResponse> {
    try {
      console.log("🚀 AuthService.register called with:", {
        email: credentials.email,
        timestamp: new Date().toISOString(),
      });

      const response = await apiClient.post<RegisterResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        credentials
      );

      console.log("📡 AuthService.register API response received:", {
        response,
        timestamp: new Date().toISOString(),
      });

      // Handle the actual API response structure
      // The response might be directly the data or wrapped in response.data
      let registerData: RegisterResponse;

      if (response.data) {
        // If response has a data property, use it
        registerData = response.data as RegisterResponse;
      } else {
        // If response is directly the data, use it as is
        registerData = response as RegisterResponse;
      }

      console.log("📦 Processed register data:", registerData);

      // If registration is successful, store the token
      if (registerData.success) {
        if (registerData.token) {
          this.setAuthToken(registerData.token);
        }

        // Store user data if needed
        if (registerData.user) {
          this.setUserData(registerData.user);
        }

        return registerData;
      }

      return registerData;
    } catch (error) {
      console.error("❌ AuthService.register error:", error, {
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  /**
   * Updates user profile information
   */
  static async updateUser(id: string, data: UpdateUserRequest): Promise<UpdateUserResponse> {
    try {
      console.log("🚀 AuthService.updateUser called with:", {
        id,
        email: data.email,
        timestamp: new Date().toISOString(),
      });

      const response = await apiClient.patch<UpdateUserResponse>(
        API_CONFIG.ENDPOINTS.USERS.UPDATE(),
        data
      );

      console.log("📡 AuthService.updateUser API response received:", {
        response,
        timestamp: new Date().toISOString(),
      });

      // Handle the actual API response structure
      let updateData: UpdateUserResponse;

      if (response.data) {
        updateData = response.data as UpdateUserResponse;
      } else {
        updateData = response as UpdateUserResponse;
      }

      console.log("📦 Processed update data:", updateData);

      // If update is successful, update stored user data
      if (updateData.success && updateData.user) {
        this.setUserData(updateData.user);
      }

      return updateData;
    } catch (error) {
      console.error("❌ AuthService.updateUser error:", error, {
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  /**
   * Verifies the current user token and returns updated user information
   * This should be called on app initialization and periodically to ensure token validity
   */
  static async verifyUser(): Promise<VerifyResponse> {
    try {
      const token = this.getAuthToken();

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await apiClient.get<VerifyResponse>(API_CONFIG.ENDPOINTS.USERS.VERIFY);

      // If verification is successful, update stored user data
      if (response.success && response.user) {
        this.setUserData(response.user);
      } else if (!response.success) {
        // If token is invalid, clear auth data
        this.clearAuthData();
      }

      return response;
    } catch (error) {
      console.error("User verification error:", error);
      // Clear auth data on verification failure
      this.clearAuthData();
      throw error;
    }
  }

  /**
   * Checks if user is currently authenticated
   */
  static isAuthenticated(): boolean {
    const token = this.getAuthToken();
    return !!token;
  }

  /**
   * Gets the stored authentication token
   */
  static getAuthToken(): string | null {
    return Cookies.get(API_CONFIG.AUTH_TOKEN_KEY) || null;
  }

  /**
   * Sets the authentication token in storage
   */
  static setAuthToken(token: string): void {
    Cookies.set(API_CONFIG.AUTH_TOKEN_KEY, token, {
      expires: 7, // 7 days
      // secure: import.meta.env.PROD,
      // sameSite: 'strict'
    });
  }

  /**
   * Gets stored user data
   */
  static getUserData(): User | null {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }

  /**
   * Sets user data in storage
   */
  static setUserData(user: User): void {
    localStorage.setItem("user", JSON.stringify(user));
  }

  /**
   * Clears all authentication data
   */
  static clearAuthData(): void {
    Cookies.remove(API_CONFIG.AUTH_TOKEN_KEY);
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
  }

  /**
   * Validates login form data
   */
  static validateLoginData(data: LoginRequest): {
    isValid: boolean;
    errors: string[];
  } {
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

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Transforms form data to API request format
   */
  static transformLoginFormData(formData: any): LoginRequest {
    return {
      email: formData.email?.trim().toLowerCase(),
      password: formData.password,
    };
  }
}

// Export individual methods for easier testing and usage
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
