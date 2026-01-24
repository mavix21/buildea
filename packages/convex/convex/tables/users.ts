import { defineTable } from "convex/server";
import { v } from "convex/values";

export const usersTable = defineTable({
  // Reference to the betterAuth component user._id
  authId: v.string(),
  // Sync fields from auth user (optional, add what you need)
  // email: v.string(),

  // Add any app-specific user fields here
  socials: v.object({
    twitter: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    telegram: v.optional(v.string()),
    website: v.optional(v.string()),
    github: v.optional(v.string()),
    farcaster: v.optional(v.string()),
  }),
}).index("by_authId", ["authId"]);
