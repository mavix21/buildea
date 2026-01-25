import { defineTable } from "convex/server";
import { v } from "convex/values";

export const communitiesTable = defineTable({
  // Reference to the betterAuth component user._id
  orgId: v.string(),
  description: v.optional(v.string()),
  logoId: v.optional(v.id("_storage")),

  // Add any app-specific user fields here
  socials: v.object({
    twitter: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    telegram: v.optional(v.string()),
    website: v.optional(v.string()),
    github: v.optional(v.string()),
    farcaster: v.optional(v.string()),
  }),
}).index("by_orgId", ["orgId"]);
