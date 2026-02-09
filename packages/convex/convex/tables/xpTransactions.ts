import { defineTable } from "convex/server";
import { v } from "convex/values";

export const xpTransactionsTable = defineTable({
  userId: v.id("users"),
  xpAmount: v.number(),

  // Multiplier applied (1.0 = none)
  multiplier: v.number(),
  finalXp: v.number(), // xpAmount * multiplier

  source: v.union(
    v.object({
      type: v.literal("quiz"),
      quizId: v.id("quizzes"),
      submissionId: v.id("quizSubmissions"),
      questionId: v.id("quizQuestions"),
    }),
    v.object({ type: v.literal("module"), moduleId: v.id("courseModules") }),
    v.object({ type: v.literal("dailyTask"), date: v.string() }),
    // Future sources can be added here
  ),

  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_user_createdAt", ["userId", "createdAt"]);
