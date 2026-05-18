import React, { useEffect, useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useVerifyUser } from "@/features/auth/hooks/useAuth";
import { AuthService } from "@/features/auth/services/authService";
import logger from "@/shared/utils/logger";
import { FullScreenLoader } from "../molecules/FullScreenLoader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ProtectedRoute component that verifies user authentication
 * and redirects to login if not authenticated or token is invalid
 */
export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const location = useLocation();

  const hasToken = useMemo(() => AuthService.isAuthenticated(), []);

  const {
    data: user,
    isLoading,
    error,
    isError,
  } = useVerifyUser({
    enabled: hasToken,
  });

  // Log only when there's an error (side effect)
  useEffect(() => {
    if (isError && error) {
      logger.error("❌ Route protection: User verification failed", error);
    }
  }, [isError, error]);

  // No token - redirect immediately
  if (!hasToken) {
    logger.info("🔒 No token found, redirecting");
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Token exists but verification is loading
  if (isLoading) {
    return fallback ?? <FullScreenLoader message="Verifying access..." />;
  }

  // Token invalid or user null - redirect
  if (isError || !user) {
    logger.info("🔒 Invalid token or user, redirecting");
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // ✅ Authenticated & verified
  return <>{children}</>;
}
