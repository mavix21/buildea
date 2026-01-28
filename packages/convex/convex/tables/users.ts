import { defineTable } from "convex/server";
import { v } from "convex/values";

export const usersTable = defineTable({
  // Reference to the betterAuth component user._id
  authId: v.string(),

  // Profile fields
  bio: v.optional(v.string()),
  bannerImageId: v.optional(v.id("_storage")),
  avatarImageId: v.optional(v.id("_storage")),
  skills: v.optional(v.array(v.string())),
  countryCode: v.optional(v.string()), // ISO 3166-1 alpha-3 (e.g., "USA", "PER")

  // Gamification fields
  xp: v.optional(v.number()),
  level: v.optional(v.number()),
  rank: v.optional(v.string()),
  dayStreak: v.optional(v.number()),
  joinedAt: v.optional(v.number()),

  // Social links
  socials: v.object({
    twitter: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    telegram: v.optional(v.string()),
    website: v.optional(v.string()),
    github: v.optional(v.string()),
    farcaster: v.optional(v.string()),
  }),
}).index("by_authId", ["authId"]);
