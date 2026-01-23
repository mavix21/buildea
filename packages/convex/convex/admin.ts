import { v } from "convex/values";

import { query } from "./_generated/server";
import { authComponent, createAuth } from "./auth";

/**
 * Get all organizations (admin only)
 * Uses better-auth admin plugin's listOrganizations
 */
export const listOrganizations = query({
  args: {},
  handler: async (ctx) => {
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

    // Verify user is admin
    const session = await auth.api.getSession({ headers });
    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // List all organizations using admin API
    const organizations = await auth.api.listOrganizations({ headers });

    return organizations ?? [];
  },
});

/**
 * Get full organization details including members (admin only)
 */
export const getFullOrganization = query({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

    // Verify user is admin
    const session = await auth.api.getSession({ headers });
    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const organization = await auth.api.getFullOrganization({
      headers,
      query: { organizationId: args.organizationId },
    });

    return organization;
  },
});

/**
 * Check if current user is admin
 */
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    const session = await auth.api.getSession({ headers });
    return session?.user?.role === "admin";
  },
});

/**
 * List all users (admin only) - for adding members to organizations
 */
export const listUsers = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

    // Verify user is admin
    const session = await auth.api.getSession({ headers });
    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const result = await auth.api.listUsers({
      headers,
      query: {
        limit: args.limit ?? 100,
        offset: args.offset ?? 0,
      },
    });

    return result;
  },
});
