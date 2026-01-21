"use client";

import type { PropsWithChildren } from "react";
import { AuthBoundary } from "@convex-dev/better-auth/react";

import { api } from "@buildea/convex/_generated/api";

import { authClient } from "@/auth/client";
import { isAuthError } from "@/auth/utils";
import { useRouter } from "@/shared/i18n";

export const ClientAuthBoundary = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  return (
    <AuthBoundary
      authClient={authClient}
      // This can do anything you like, a redirect is typical.
      onUnauth={() => router.replace("/login")}
      getAuthUserFn={api.auth.getCurrentUser}
      isAuthError={isAuthError}
    >
      {children}
    </AuthBoundary>
  );
};
