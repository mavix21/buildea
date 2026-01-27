import { v } from "convex/values";

import { components } from "../_generated/api";
import { query } from "../_generated/server";
import { Doc } from "../betterAuth/_generated/dataModel";

/**
 * Get builder profile by identifier (username or authId)
 * Public query - no auth required
 */
export const getBuilderProfileByIdentifier = query({
  args: { identifier: v.string() },
  handler: async (ctx, args) => {
    const { identifier } = args;

    let authUser: Doc<"user"> | null = null;
    // First, try to find auth user by username
    authUser = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "username", operator: "eq", value: identifier }],
    });

    // Fallback: try to find by authId (_id)
    // Wrap in try-catch because invalid ID format throws
    if (!authUser) {
      try {
        authUser = await ctx.runQuery(components.betterAuth.adapter.findOne, {
          model: "user",
          where: [{ field: "_id", operator: "eq", value: identifier }],
        });
      } catch {
        // Invalid ID format - identifier is neither username nor valid ID
        return null;
      }
    }

    if (!authUser) {
      return null;
    }

    // Get app user data
    const appUser = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", authUser._id))
      .unique();

    // Resolve storage URLs
    let bannerUrl: string | null = null;
    let avatarUrl: string | null = null;

    if (appUser?.bannerImageId) {
      bannerUrl = await ctx.storage.getUrl(appUser.bannerImageId);
    }

    // Avatar priority: avatarImageId > auth user image
    if (appUser?.avatarImageId) {
      avatarUrl = await ctx.storage.getUrl(appUser.avatarImageId);
    } else if (authUser.image) {
      avatarUrl = authUser.image;
    }

    return {
      authId: authUser._id,
      name: authUser.name,
      email: authUser.email,
      image: authUser.image ?? null,
      username: authUser.username ?? null,
      bio: appUser?.bio ?? null,
      bannerUrl,
      avatarUrl,
      skills: appUser?.skills ?? [],
      xp: appUser?.xp ?? 0,
      level: appUser?.level ?? 1,
      rank: appUser?.rank ?? "Bronze",
      dayStreak: appUser?.dayStreak ?? 0,
      joinedAt: appUser?.joinedAt ?? authUser.createdAt,
      socials: {
        twitter: appUser?.socials?.twitter ?? null,
        linkedin: appUser?.socials?.linkedin ?? null,
        telegram: appUser?.socials?.telegram ?? null,
        website: appUser?.socials?.website ?? null,
        github: appUser?.socials?.github ?? null,
        farcaster: appUser?.socials?.farcaster ?? null,
      },
      // Placeholder values
      followersCount: 0,
      followingCount: 0,
      badgesCount: 0,
    };
  },
});

/**
 * Check if username is available (for future edit profile)
 */
export const isUsernameAvailable = query({
  args: { username: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const existing = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "username", operator: "eq", value: args.username }],
    });
    return existing === null;
  },
});
