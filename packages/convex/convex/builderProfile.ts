import { v } from "convex/values";

import { components } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import { Doc } from "./betterAuth/_generated/dataModel";
import { vv } from "./schema";

/**
 * Get builder profile by identifier (username or authId)
 * Public query - no auth required
 */
export const getBuilderProfileByIdentifier = query({
  args: { identifier: v.string() },
  handler: async (ctx, args) => {
    const { identifier } = args;

    // Get current authenticated user (if any)
    const identity = await ctx.auth.getUserIdentity();
    const currentUserAuthId = identity?.subject ?? null;

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
      dayStreak: appUser?.dayStreak ?? 0,
      joinedAt: appUser?.joinedAt ?? authUser.createdAt,
      socials: appUser?.socials ?? {},
      countryCode: appUser?.countryCode ?? null,
      // Placeholder values
      followersCount: 0,
      followingCount: 0,
      badgesCount: 0,
      // Auth comparison
      isOwnProfile: currentUserAuthId === authUser._id,
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

/**
 * Get the current authenticated user's profile for editing
 */
export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);

    // Get app user data
    const appUser = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", authUser._id))
      .unique();

    // Resolve avatar URL
    let avatarUrl: string | null = null;
    if (appUser?.avatarImageId) {
      avatarUrl = await ctx.storage.getUrl(appUser.avatarImageId);
    } else if (authUser.image) {
      avatarUrl = authUser.image;
    }

    return {
      authId: authUser._id,
      name: authUser.name,
      email: authUser.email,
      username: authUser.username ?? null,
      avatarUrl,
      bio: appUser?.bio ?? null,
      countryCode: appUser?.countryCode ?? null,
      skills: appUser?.skills ?? [],
      socials: appUser?.socials ?? {},
    };
  },
});

/**
 * Check if a username is available (excluding current user)
 */
export const checkUsernameAvailable = query({
  args: { username: v.string() },
  returns: v.boolean(),
  handler: async (ctx, { username }) => {
    const identity = await ctx.auth.getUserIdentity();

    const existing = await ctx.runQuery(
      components.betterAuth.authUser.findByUsername,
      {
        username,
      },
    );

    // Available if no user has it, or if current user owns it
    if (!existing) return true;
    if (identity && existing._id === identity.subject) return true;
    return false;
  },
});

/**
 * Update auth user fields (name, username)
 */
export const updateAuthProfile = mutation({
  args: {
    name: v.string(),
    username: v.optional(v.string()),
  },
  handler: async (ctx, { name, username }) => {
    const authUser = await authComponent.getAuthUser(ctx);

    // If username provided, check availability
    if (username) {
      const existing = await ctx.runQuery(
        components.betterAuth.authUser.findByUsername,
        {
          username,
        },
      );

      if (existing && existing._id !== authUser._id) {
        throw new Error("Username already taken");
      }
    }

    // Update auth user
    await ctx.runMutation(components.betterAuth.adapter.updateOne, {
      input: {
        model: "user",
        where: [{ field: "_id", operator: "eq", value: authUser._id }],
        update: {
          name,
          username: username ?? null,
          updatedAt: Date.now(),
        },
      },
    });

    return { success: true };
  },
});

/**
 * Update app user profile fields (bio, skills, socials)
 */
export const updateProfile = mutation({
  args: {
    bio: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    socials: v.optional(vv.doc("users").fields.socials),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get or create app user
    let appUser = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
      .unique();

    if (!appUser) {
      // Create app user if it doesn't exist
      const newId = await ctx.db.insert("users", {
        authId: identity.subject,
        bio: args.bio,
        countryCode: args.countryCode,
        skills: args.skills,
        socials: args.socials ?? {},
        totalXp: 0,
      });
      return { success: true, id: newId };
    }

    // Update existing app user
    await ctx.db.patch(appUser._id, {
      bio: args.bio,
      countryCode: args.countryCode,
      skills: args.skills,
      socials: args.socials,
    });

    return { success: true, id: appUser._id };
  },
});

/**
 * Generate upload URL for avatar
 */
export const generateAvatarUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Save avatar after upload
 */
export const saveAvatar = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get or create app user
    let appUser = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
      .unique();

    if (!appUser) {
      // Create app user with avatar
      const newId = await ctx.db.insert("users", {
        authId: identity.subject,
        avatarImageId: args.storageId,
        socials: {},
        totalXp: 0,
      });
      return { success: true, id: newId };
    }

    // Delete old avatar if exists
    if (appUser.avatarImageId) {
      await ctx.storage.delete(appUser.avatarImageId);
    }

    // Update with new avatar
    await ctx.db.patch(appUser._id, {
      avatarImageId: args.storageId,
    });

    return { success: true, id: appUser._id };
  },
});
