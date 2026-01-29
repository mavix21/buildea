import type { AuthFunctions } from "@convex-dev/better-auth";
import { createClient, GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth, BetterAuthOptions } from "better-auth";
import { admin, organization } from "better-auth/plugins";

import { betterAuthOptions } from "@buildea/auth";

import { components, internal } from "./_generated/api";
import { DataModel, Doc } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";
import { Doc as AuthDoc } from "./betterAuth/_generated/dataModel";
import authSchema from "./betterAuth/generatedSchema";

const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

const authFunctions: AuthFunctions = internal.auth;

export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth as any,
  {
    authFunctions,
    local: {
      schema: authSchema,
    },
    triggers: {
      user: {
        onCreate: async (ctx, authUser) => {
          // Create app user linked to auth user
          const userId = await ctx.db.insert("users", {
            authId: authUser._id,
            socials: {},
          });
          // Use authComponent.setUserId helper instead of calling the mutation directly
          // to avoid module evaluation issues that trigger auth config validation
          // await authComponent.setUserId(ctx, authUser._id, userId);
          await ctx.runMutation(components.betterAuth.authUser.setUserId, {
            authId: authUser._id,
            userId: userId,
          });
        },
      },
      account: {
        onCreate: async (ctx, account) => {
          // When a GitHub account is linked, auto-fill the github social field
          if (account.providerId === "github") {
            // Query the auth user to get the githubUsername (set via mapProfileToUser)
            const authUser: AuthDoc<"user"> | null = await ctx.runQuery(
              components.betterAuth.adapter.findOne,
              {
                model: "user",
                where: [
                  {
                    field: "_id",
                    operator: "eq",
                    value: account.userId,
                  },
                ],
              },
            );

            if (authUser?.githubUsername) {
              // Find the app user by authId
              const appUser: Doc<"users"> | null = await ctx.db
                .query("users")
                .withIndex("by_authId", (q) => q.eq("authId", account.userId))
                .unique();

              if (appUser) {
                // Update the user's socials with GitHub URL
                await ctx.db.patch(appUser._id, {
                  socials: {
                    ...appUser.socials,
                    github: authUser.githubUsername,
                  },
                });
              }
            }
          }
        },
      },
      organization: {
        onCreate: async (ctx, organization) => {
          await ctx.db.insert("communities", {
            orgId: organization._id,
            socials: {},
          });
        },
        onDelete: async (ctx, organization) => {
          const community = await ctx.db
            .query("communities")
            .withIndex("by_orgId", (q) => q.eq("orgId", organization._id))
            .first();

          if (community) {
            ctx.db.delete(community._id);
          }
        },
      },
    },
  },
);

// Export trigger handlers - required for triggers to work
export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();

export const createAuthOptions = (
  ctx: GenericCtx<DataModel>,
  opts?: { optionsOnly?: boolean },
) => {
  return betterAuthOptions({
    baseUrl: siteUrl,
    database: authComponent.adapter(ctx),
    secret: process.env.BETTER_AUTH_SECRET,
    optionsOnly: opts?.optionsOnly ?? false,
    extraPlugins: [
      convex({ authConfig }),
      admin(),
      organization({
        allowUserToCreateOrganization: async (user) => {
          return user.role === "admin";
        },
      }),
    ],
  }) satisfies BetterAuthOptions;
};

export const createAuth = (
  ctx: GenericCtx<DataModel>,
  opts?: { optionsOnly?: boolean },
) => {
  return betterAuth(createAuthOptions(ctx, opts));
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    return {
      ...user,
      id: user._id,
    };
  },
});

export const getCurrentUserClient = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.image ?? null,
      role: user.role ?? null,
      username: user.username ?? null,
    };
  },
});
