import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useVerifyUser, useSetupStatus } from "@/features/auth/hooks/useAuth";
import { AuthService } from "@/features/auth/services/authService";
import logger from "@/shared/utils/logger";
import { FullScreenLoader } from "../molecules/FullScreenLoader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const location = useLocation();
  const hasToken = AuthService.isAuthenticated();

  const { data: setupStatus, isLoading: isSetupLoading } = useSetupStatus({
    enabled: !hasToken,
  });

  const {
    data: user,
    isLoading: isUserLoading,
    error,
    isError,
  } = useVerifyUser({
    enabled: hasToken,
  });

  useEffect(() => {
    if (isError && error) {
      logger.error("❌ Route protection: User verification failed", error);
    }
  }, [isError, error]);

  if (!hasToken) {
    if (isSetupLoading) {
      return fallback ?? <FullScreenLoader message="Checking shop setup…" />;
    }

    if (setupStatus?.needsSetup) {
      return <Navigate to="/setup" state={{ from: location }} replace />;
    }

    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  if (isUserLoading) {
    return fallback ?? <FullScreenLoader message="Verifying access..." />;
  }

  if (isError || !user) {
    logger.info("🔒 Invalid token or user, redirecting");
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  if (user.role !== "admin") {
    logger.info("🔒 Non-admin user, redirecting");
    AuthService.clearAuthData();
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
