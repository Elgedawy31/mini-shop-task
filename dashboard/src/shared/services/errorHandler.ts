import { toast } from "sonner";
import logger from "../utils/logger";

import type { ApiClientError } from "../types/api";
import { isApiErrorBody, parseErrorBody } from "../lib/apiResponse";

export interface ApiErrorResponse {
  success?: boolean;
  statusCode?: number;
  error?: string;
  message?: string;
  errors?: string[];
}

// Error types for better categorization
export const ErrorType = {
  NETWORK: "network",
  VALIDATION: "validation",
  AUTHENTICATION: "authentication",
  AUTHORIZATION: "authorization",
  SERVER: "server",
  UNKNOWN: "unknown",
} as const;

export type ErrorType = (typeof ErrorType)[keyof typeof ErrorType];

// Error severity levels
export const ErrorSeverity = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export type ErrorSeverity = (typeof ErrorSeverity)[keyof typeof ErrorSeverity];

export interface ErrorInfo {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  originalError?: any;
  context?: Record<string, any>;
}

/**
 * Professional Error Handler Service
 * Handles all error scenarios across the application with toast notifications
 */
export class ErrorHandler {
  /**
   * Handle API errors from your backend
   */
  static handleApiError(error: unknown, context?: Record<string, unknown>): void {
    console.error("🚨 API Error:", error, context);

    let errorMessage = "An unexpected error occurred";
    let errorType: ErrorType = ErrorType.UNKNOWN;
    let severity: ErrorSeverity = ErrorSeverity.MEDIUM;
    let status: number | undefined;

    // Normalized client error from apiClient
    if (error && typeof error === "object" && "message" in error && !("response" in error)) {
      const clientError = error as ApiClientError;
      errorMessage = clientError.message;
      status = clientError.status;
    } else if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      (error as { response?: { data?: unknown; status?: number } }).response?.data
    ) {
      const response = (error as { response: { data: unknown; status: number } }).response;
      const parsed = parseErrorBody(response.data);

      if (parsed) {
        errorMessage = parsed.message;
        status = parsed.status ?? response.status;
      } else {
        const apiError = response.data as ApiErrorResponse;
        if (isApiErrorBody(apiError)) {
          errorMessage = apiError.message;
          status = apiError.statusCode;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        } else if (typeof apiError.error === "string") {
          errorMessage = apiError.error;
        } else if (apiError.errors?.length) {
          errorMessage = apiError.errors[0];
        }
        status = response.status;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    if (status !== undefined) {
      if (status === 401) {
        errorType = ErrorType.AUTHENTICATION;
        severity = ErrorSeverity.HIGH;
        errorMessage = "Please log in to continue";
      } else if (status === 403) {
        errorType = ErrorType.AUTHORIZATION;
        severity = ErrorSeverity.HIGH;
        errorMessage = "You do not have permission to perform this action";
      } else if (status >= 400 && status < 500) {
        errorType = ErrorType.VALIDATION;
        severity = ErrorSeverity.MEDIUM;
      } else if (status >= 500) {
        errorType = ErrorType.SERVER;
        severity = ErrorSeverity.HIGH;
        if (errorMessage === "An unexpected error occurred") {
          errorMessage = "Server error. Please try again later.";
        }
      }
    } else if (
      error &&
      typeof error === "object" &&
      "request" in error &&
      !(error as { response?: unknown }).response
    ) {
      errorType = ErrorType.NETWORK;
      severity = ErrorSeverity.HIGH;
      errorMessage = "Network error. Please check your connection.";
    }

    // Show toast notification
    this.showErrorToast(errorMessage, errorType, severity);

    // Log error for debugging
    this.logError({
      type: errorType,
      severity,
      message: errorMessage,
      originalError: error,
      context,
    });
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(message: string, context?: Record<string, any>): void {
    this.showErrorToast(message, ErrorType.VALIDATION, ErrorSeverity.MEDIUM);
    this.logError({
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      message,
      context,
    });
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(context?: Record<string, any>): void {
    const message = "Network error. Please check your connection and try again.";
    this.showErrorToast(message, ErrorType.NETWORK, ErrorSeverity.HIGH);
    this.logError({
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.HIGH,
      message,
      context,
    });
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(message?: string, context?: Record<string, any>): void {
    const errorMessage = message || "Authentication required. Please log in.";
    this.showErrorToast(errorMessage, ErrorType.AUTHENTICATION, ErrorSeverity.HIGH);
    this.logError({
      type: ErrorType.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      message: errorMessage,
      context,
    });

    // Optionally redirect to login
    // window.location.href = '/login'
  }

  /**
   * Show success toast
   */
  static showSuccess(message: string): void {
    toast.success(message, {
      duration: 4000,
      position: "top-right",
    });
  }

  /**
   * Show info toast
   */
  static showInfo(message: string): void {
    toast.info(message, {
      duration: 4000,
      position: "top-right",
    });
  }

  /**
   * Show warning toast
   */
  static showWarning(message: string): void {
    toast.warning(message, {
      duration: 5000,
      position: "top-right",
    });
  }

  /**
   * Show error toast with appropriate styling
   */
  private static showErrorToast(message: string, _type: ErrorType, severity: ErrorSeverity): void {
    const duration =
      severity === ErrorSeverity.CRITICAL ? 8000 : severity === ErrorSeverity.HIGH ? 6000 : 4000;

    toast.error(message, {
      duration,
      position: "top-right",
      action:
        severity === ErrorSeverity.CRITICAL
          ? {
              label: "Report Issue",
              onClick: () => {
                // Handle critical error reporting
                logger.info("Report issue clicked");
              },
            }
          : undefined,
    });
  }

  /**
   * Log error for debugging and monitoring
   */
  private static logError(errorInfo: ErrorInfo): void {
    const logData = {
      timestamp: new Date().toISOString(),
      ...errorInfo,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.group(`🚨 Error [${errorInfo.type}] - ${errorInfo.severity}`);
      console.error("Message:", errorInfo.message);
      console.error("Original Error:", errorInfo.originalError);
      console.error("Context:", errorInfo.context);
      console.error("Full Log Data:", logData);
      console.groupEnd();
    }

    // In production, you might want to send to error monitoring service
    // Example: Sentry, LogRocket, etc.
    // if (import.meta.env.PROD) {
    //   sendToErrorMonitoring(logData)
    // }
  }
}

// Convenience functions for common use cases
export const showSuccess = (message: string) => ErrorHandler.showSuccess(message);
export const showError = (message: string) => ErrorHandler.handleValidationError(message);
export const showInfo = (message: string) => ErrorHandler.showInfo(message);
export const showWarning = (message: string) => ErrorHandler.showWarning(message);
export const handleApiError = (error: any, context?: Record<string, any>) =>
  ErrorHandler.handleApiError(error, context);
