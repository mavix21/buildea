import { ConvexError } from "convex/values";

/**
 * Error codes for authentication and authorization errors
 */
export const ErrorCode = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  FORBIDDEN: "FORBIDDEN",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * Structured error data for ConvexError
 */
export interface AuthErrorData {
  code: ErrorCode;
  message: string;
}

/**
 * Type guard to check if error data is an AuthErrorData
 */
export const isAuthErrorData = (data: unknown): data is AuthErrorData => {
  return (
    typeof data === "object" &&
    data !== null &&
    "code" in data &&
    typeof (data as AuthErrorData).code === "string" &&
    Object.values(ErrorCode).includes((data as AuthErrorData).code as ErrorCode)
  );
};

/**
 * Check if a ConvexError is an authentication error (UNAUTHENTICATED or FORBIDDEN)
 */
export const isAuthError = (error: unknown): boolean => {
  if (!(error instanceof ConvexError)) {
    return false;
  }

  if (error.message === "Unauthenticated") {
    return true;
  }

  return isAuthErrorData(error.data);
};

/**
 * Check if error is specifically an unauthenticated error
 */
export const isUnauthenticatedError = (error: unknown): boolean => {
  if (!(error instanceof ConvexError)) {
    return false;
  }
  return (
    isAuthErrorData(error.data) && error.data.code === ErrorCode.UNAUTHENTICATED
  );
};

/**
 * Check if error is specifically a forbidden error
 */
export const isForbiddenError = (error: unknown): boolean => {
  if (!(error instanceof ConvexError)) {
    return false;
  }
  return isAuthErrorData(error.data) && error.data.code === ErrorCode.FORBIDDEN;
};

/**
 * Throw an unauthenticated error
 * Use when the user is not logged in
 */
export const throwUnauthenticated = (
  message = "Authentication required",
): never => {
  throw new ConvexError({
    code: ErrorCode.UNAUTHENTICATED,
    message,
  } satisfies AuthErrorData);
};

/**
 * Throw a forbidden error
 * Use when the user is logged in but lacks permission
 */
export const throwForbidden = (message = "Access denied"): never => {
  throw new ConvexError({
    code: ErrorCode.FORBIDDEN,
    message,
  } satisfies AuthErrorData);
};
