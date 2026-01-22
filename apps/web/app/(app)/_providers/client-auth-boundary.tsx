"use client";

import type { PropsWithChildren } from "react";
import { useRouter } from "next/navigation";
import { AuthBoundary } from "@convex-dev/better-auth/react";
import { useLocale } from "next-intl";

import { api } from "@buildea/convex/_generated/api";

import { authClient } from "@/auth/client";
import { isAuthError } from "@/auth/utils";

export const ClientAuthBoundary = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const locale = useLocale();

  return (
    <AuthBoundary
      authClient={authClient}
      // This can do anything you like, a redirect is typical.
      onUnauth={() => router.replace(`/${locale}/login`)}
      getAuthUserFn={api.auth.getCurrentUser}
      isAuthError={isAuthError}
    >
      {children}
    </AuthBoundary>
  );
};
