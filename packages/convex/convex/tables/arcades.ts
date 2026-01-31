import { defineTable } from "convex/server";
import { v } from "convex/values";

export const arcadesTable = defineTable({
  title: v.string(),
  image: v.id("_storage"),
  description: v.string(),
  quizId: v.id("quizzes"),
});
