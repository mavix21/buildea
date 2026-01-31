import { defineTable } from "convex/server";
import { v } from "convex/values";

export const quizzesTable = defineTable({
  title: v.string(),
  description: v.optional(v.string()),
  coverImage: v.optional(v.id("_storage")),
  creatorId: v.id("users"),

  lifes: v.optional(v.number()),
  timeLimitSeconds: v.optional(v.number()),
  passingScore: v.number(),
  allowedAttempts: v.optional(v.number()),
  suffleQuestions: v.boolean(),
});
