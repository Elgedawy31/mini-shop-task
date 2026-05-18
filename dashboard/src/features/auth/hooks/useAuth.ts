import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import logger from "@/shared/utils/logger";
import { useNavigate } from "react-router-dom";
import {
  AuthService,
  clearAuthData,
  type LoginFormData,
  type RegisterFormData,
  type RegisterRequestData,
} from "..";
// Query keys for consistent cache management
export const AUTH_QUERY_KEYS = {
  all: ["auth"] as const,
  user: () => [...AUTH_QUERY_KEYS.all, "user"] as const,
} as const;

/**
 * Hook for user verification query - validates token and gets fresh user data
 * This should be used on app initialization and for periodic token validation
 */
export const useVerifyUser = (options?: { enabled?: boolean }) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: AUTH_QUERY_KEYS.user(),
    queryFn: async () => {
      const response = await AuthService.verifyUser();

      if (!response.success) {
        logger.error("❌ User verification failed:", response.error);
        throw new Error(response.error || "Token verification failed");
      }

      return response.user;
    },
    enabled: options?.enabled ?? AuthService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry verification failures
  });

  // Handle errors using useEffect-like pattern
  if (query.error) {
    logger.error("❌ User verification error:", query.error);
    // Clear cached user data on verification failure
    queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.user() });
  }

  return query;
};

/**
 * Hook for login mutation with professional error handling
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginFormData) => {
      logger.info("🔄 Login mutation called with:", { email: credentials.email });

      const response = await AuthService.login(credentials);

      if (!response.success) {
        logger.error("❌ Login failed:", response.error || response.message);
        throw new Error(response.error || response.message || "Login failed");
      }

      return response;
    },
    retry: false, // Disable retries for login to prevent double requests
    onSuccess: (data) => {
      logger.info("✅ Login mutation success");
      // Cache user data
      if (data?.user && data.token) {
        queryClient.setQueryData(AUTH_QUERY_KEYS.user(), data.user);
      }
    },
    onError: (error) => {
      logger.error("❌ Login mutation error:", error);
    },
  });
};

/**
 * Hook for register mutation with professional error handling
 */
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: RegisterFormData) => {
      logger.info("🔄 Register mutation called with:", { email: formData.email });

      // Transform form data to backend request (remove confirmPassword)
      const requestData: RegisterRequestData = {
        email: formData.email,
        password: formData.password,
      };

      const response = await AuthService.register(requestData);

      if (!response.success) {
        logger.error("❌ Register failed:", response.error || response.message);
        throw new Error(response.error || response.message || "Registration failed");
      }

      return response;
    },
    retry: false, // Disable retries for register to prevent double requests
    onSuccess: (data) => {
      logger.info("✅ Register mutation success");
      // Cache user data
      if (data?.user && data.token) {
        queryClient.setQueryData(AUTH_QUERY_KEYS.user(), data.user);
      }
    },
    onError: (error) => {
      logger.error("❌ Register mutation error:", error);
    },
  });
};

export function useAuth() {
  const loginMutation = useLogin();

  return {
    // State
    isLoading: loginMutation.isPending,
    error: loginMutation.error?.message || null,
    user: AuthService.getUserData(),
    isAuthenticated: AuthService.isAuthenticated(),

    // Actions
    login: async (credentials: LoginFormData): Promise<boolean> => {
      try {
        await loginMutation.mutateAsync(credentials);
        return true;
      } catch {
        return false;
      }
    },
    clearError: () => loginMutation.reset(),
  };
}

// Export individual auth utilities for direct usage
export const authUtils = {
  isAuthenticated: AuthService.isAuthenticated,
  getAuthToken: AuthService.getAuthToken,
  getUserData: AuthService.getUserData,
  clearAuthData: AuthService.clearAuthData,
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logout = () => {
    // 1. clear cookies/localStorage
    clearAuthData();

    // 2. flush any cached auth/user queries
    queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.all });

    // 3. redirect to login
    navigate("/sign-in");
  };

  return logout;
};
