import { defineTable } from "convex/server";
import { v } from "convex/values";

export const quizzesTable = defineTable({
  title: v.string(),
  description: v.optional(v.string()),
  coverImage: v.optional(v.id("_storage")),
  creatorId: v.id("users"),

  scoringMode: v.union(
    v.object({ type: v.literal("lives"), lives: v.number() }),
    v.object({ type: v.literal("passing_score"), passingScore: v.number() }),
    v.object({ type: v.literal("practice") }),
  ),
  timeLimitSeconds: v.optional(v.number()),
  shuffleQuestions: v.boolean(),
});
