import { ConvexError } from "convex/values";

export const isAuthError = (error: unknown) => {
  // This broadly matches potentially auth related errors, can be rewritten to
  // work with your app's own error handling.
  const message =
    (error instanceof ConvexError &&
      typeof error.data === "string" &&
      error.data) ||
    (error instanceof Error && error.message) ||
    "";
  return /auth/i.test(message);
};
