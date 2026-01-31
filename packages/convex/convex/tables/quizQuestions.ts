import { defineTable } from "convex/server";
import { v } from "convex/values";

const option = v.object({
  id: v.string(),
  text: v.string(),
  image: v.optional(v.id("_storage")),
});

export const quizQuestionsTable = defineTable({
  quizId: v.id("quizzes"),

  prompt: v.string(),
  richContent: v.optional(
    v.object({
      type: v.literal("code_snippet"),
      language: v.string(),
      code: v.string(),
    }),
  ),
  difficulty: v.union(
    v.literal("easy"),
    v.literal("intermediate"),
    v.literal("hard"),
    v.literal("insane"),
  ),
  explanation: v.string(),
  order: v.number(),
  points: v.number(),

  typeConfig: v.union(
    v.object({
      type: v.literal("single_choice"),
      options: v.array(option),
      correctAnswerId: v.string(),
    }),
    v.object({
      type: v.literal("multiple_choice"),
      options: v.array(option),
      correctAnswerIds: v.array(v.string()),
    }),
    v.object({
      type: v.literal("true_or_false"),
      correctAnswer: v.boolean(),
    }),
  ),
}).index("by_quizId", ["quizId"]);
