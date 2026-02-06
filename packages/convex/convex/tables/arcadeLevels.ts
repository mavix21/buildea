import { defineTable } from "convex/server";
import { v } from "convex/values";

export const arcadeLevels = defineTable({
  arcadeId: v.id("arcades"),
  level: v.number(),
  quizId: v.id("quizzes"),
  labelDifficulty: v.union(
    v.literal("easy"),
    v.literal("medium"),
    v.literal("hard"),
    v.literal("insane"),
  ),

  passingScore: v.number(),

  badgeConfig: v.optional(
    v.object({
      tokenId: v.string(),
      name: v.string(),
      imageUrl: v.string(),
    }),
  ),
})
  .index("by_arcade_level", ["arcadeId", "level"])
  .index("by_quiz", ["quizId"]);
