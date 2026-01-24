import { isAuthError as isConvexAuthError } from "@buildea/convex/errors";

export const isAuthError = (error: unknown): boolean => {
  return isConvexAuthError(error);
};
