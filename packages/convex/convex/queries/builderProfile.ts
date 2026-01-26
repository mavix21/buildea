import { v } from "convex/values";

import { components } from "../_generated/api";
import { query } from "../_generated/server";

/**
 * Get builder profile by identifier (username or authId)
 * Public query - no auth required
 */
export const getBuilderProfileByIdentifier = query({
  args: { identifier: v.string() },
  returns: v.union(
    v.object({
      authId: v.string(),
      name: v.string(),
      email: v.string(),
      image: v.union(v.string(), v.null()),
      username: v.union(v.string(), v.null()),
      bio: v.union(v.string(), v.null()),
      bannerUrl: v.union(v.string(), v.null()),
      avatarUrl: v.union(v.string(), v.null()),
      skills: v.array(v.string()),
      xp: v.number(),
      level: v.number(),
      rank: v.string(),
      dayStreak: v.number(),
      joinedAt: v.number(),
      socials: v.object({
        twitter: v.union(v.string(), v.null()),
        linkedin: v.union(v.string(), v.null()),
        telegram: v.union(v.string(), v.null()),
        website: v.union(v.string(), v.null()),
        github: v.union(v.string(), v.null()),
        farcaster: v.union(v.string(), v.null()),
      }),
      // Placeholder counts for future implementation
      followersCount: v.number(),
      followingCount: v.number(),
      badgesCount: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const { identifier } = args;

    // First, try to find auth user by username
    let authUser = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "username", operator: "eq", value: identifier }],
    });

    // Fallback: try to find by authId (_id)
    if (!authUser) {
      authUser = await ctx.runQuery(components.betterAuth.adapter.findOne, {
        model: "user",
        where: [{ field: "_id", operator: "eq", value: identifier }],
      });
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
