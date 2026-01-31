import { defineTable } from "convex/server";
import { v } from "convex/values";

import { userAnswer } from "./utils";

export const quizSubmissionsTable = defineTable({
  userId: v.id("users"),
  quizId: v.id("quizzes"),

  // Snapshot del contexto donde se resolvió.
  // Esto es vital para calcular puntos por categoría o ver progreso de un curso.
  source: v.union(
    v.object({ type: v.literal("workshop"), workshopId: v.id("workshops") }),
    v.object({ type: v.literal("course"), moduleId: v.id("courseModules") }),
    v.object({ type: v.literal("arcade"), arcadeId: v.id("arcades") }),
    v.object({ type: v.literal("daily"), date: v.string() }),
  ),

  completedAt: v.optional(v.number()),
  score: v.number(),

  totalTimeSpent: v.number(),

  answers: v.array(
    v.object({
      questionId: v.id("quizQuestions"),
      timeSpentSeconds: v.number(),
      isCorrect: v.boolean(),
      pointsAwarded: v.number(),

      userAnswer: userAnswer,
    }),
  ),
})
  .index("by_user", ["userId"])
  .index("by_quiz_user", ["quizId", "userId"])
  .index("by_source_workshop", ["source.workshopId", "userId"])
  .index("by_source_arcade", ["source.arcadeId", "userId"]);
