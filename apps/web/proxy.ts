import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "@convex-dev/better-auth/utils";
import { getSessionCookie } from "better-auth/cookies";
import { fetchQuery } from "convex/nextjs";
import createIntlMiddleware from "next-intl/middleware";

import { api } from "@buildea/convex/_generated/api";

import { env } from "@/env";

import { locales, routing } from "./app/_shared/i18n";

// Initialize the next-intl middleware
const handleI18nRouting = createIntlMiddleware(routing);

// Public pages that don't require authentication (without locale prefix)
const publicPages = ["/", "/login", "/register", "/about"];

// Routes that should redirect to dashboard if already authenticated (without locale prefix)
const authPages = ["/login", "/register"];

// Admin routes that require admin role (without locale prefix)
const adminRoutePrefix = "/dashboard/admin";

// Create a regex that matches public pages with optional locale prefix
const publicPathnameRegex = RegExp(
  `^(/(${locales.join("|")}))?(${publicPages.flatMap((p) => (p === "/" ? ["", "/"] : p)).join("|")})/?$`,
  "i",
);

// Create a regex that matches auth pages with optional locale prefix
const authPathnameRegex = RegExp(
  `^(/(${locales.join("|")}))?(${authPages.flatMap((p) => (p === "/" ? ["", "/"] : p)).join("|")})/?$`,
  "i",
);

// Create a regex that matches admin routes with optional locale prefix
const adminPathnameRegex = RegExp(
  `^(/(${locales.join("|")}))?${adminRoutePrefix}(/.*)?$`,
  "i",
);

/**
 * Gets the locale from the pathname or returns the default
 */
function getLocaleFromPathname(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  if (
    firstSegment &&
    locales.includes(firstSegment as (typeof locales)[number])
  ) {
    return firstSegment;
  }
  return routing.defaultLocale;
}

/**
 * Check if user has admin role by calling the Convex isAdmin query.
 * This validates the session against the database for reliable role checking.
 */
async function isAdminUser(request: NextRequest): Promise<boolean> {
  try {
    // Get a valid JWT token using the Better Auth utilities
    // This handles token refresh and caching automatically
    const { token } = await getToken(
      env.NEXT_PUBLIC_CONVEX_SITE_URL,
      request.headers,
    );

    if (!token) {
      return false;
    }

    // Call the Convex isAdmin query with the authenticated token
    const isAdmin = await fetchQuery(
      api.admin.isAdmin,
      {},
      { token, url: env.NEXT_PUBLIC_CONVEX_URL },
    );

    return isAdmin === true;
  } catch (error) {
    // If the query fails, deny access for safety
    // The user will see a proper error on the page level
    console.error("Admin check failed:", error);
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the page is public
  const isPublicPage = publicPathnameRegex.test(pathname);

  const locale = getLocaleFromPathname(pathname);
  // Check for session cookie (fast, no DB call)
  // NOTE: This only checks cookie existence, not validity.
  // Always validate the session in your pages/API routes for security.
  const sessionCookie = getSessionCookie(request);
  const isAuthenticated = !!sessionCookie;

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (isAuthenticated && authPathnameRegex.test(pathname)) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // If it's a public page, just handle i18n routing
  if (isPublicPage) {
    return handleI18nRouting(request);
  }

  // For protected pages, check authentication
  if (!isAuthenticated) {
    const signInUrl = new URL(`/${locale}/login`, request.url);
    // Store the original URL to redirect back after sign-in
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // For admin routes, check if user has admin role
  if (adminPathnameRegex.test(pathname)) {
    const isAdmin = await isAdminUser(request);
    if (!isAdmin) {
      // Redirect non-admin users to dashboard with access denied
      const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
      // dashboardUrl.searchParams.set("error", "access_denied");
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // User is authenticated, handle i18n routing normally
  return handleI18nRouting(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
