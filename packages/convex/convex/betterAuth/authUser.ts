import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const setUserId = mutation({
  args: {
    authId: v.id("user"),
    userId: v.string(),
  },
  handler: async (ctx, { authId, userId }) => {
    await ctx.db.patch(authId, {
      userId: userId,
    });
  },
});

export const findByUsername = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, { username }) => {
    return await ctx.db
      .query("user")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();
  },
});
