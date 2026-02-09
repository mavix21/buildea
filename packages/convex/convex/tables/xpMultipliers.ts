import { defineTable } from "convex/server";
import { v } from "convex/values";

export const xpMultipliersTable = defineTable({
  name: v.string(),
  multiplier: v.number(), // e.g., 1.5 = 50% bonus

  scope: v.union(
    v.object({ type: v.literal("global") }), // Affects all users
    v.object({ type: v.literal("user"), userId: v.id("users") }), // User-specific item
  ),

  startsAt: v.number(),
  endsAt: v.number(),
  isActive: v.boolean(),
})
  .index("by_active", ["isActive", "startsAt", "endsAt"])
  .index("by_scope_user", ["scope.userId"]);
