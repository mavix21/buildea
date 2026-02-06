import { defineTable } from "convex/server";
import { v } from "convex/values";

export const notificationsTable = defineTable({
  userId: v.id("users"),
  isRead: v.boolean(),

  event: v.union(
    v.object({
      type: v.literal("workshop_announced"),
      workshopId: v.id("workshops"),
    }),
    v.object({
      type: v.literal("badge_unlocked"),
    }),
    v.object({
      type: v.literal("level_up"),
      newLevel: v.number(),
    }),
  ),
})
  .index("by_userId", ["userId"])
  .index("by_user_unread", ["userId", "isRead"]);
