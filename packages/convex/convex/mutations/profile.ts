import { v } from "convex/values";

import { components } from "../_generated/api";
import { mutation, query } from "../_generated/server";
import { authComponent } from "../auth";
import { vv } from "../schema";

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
