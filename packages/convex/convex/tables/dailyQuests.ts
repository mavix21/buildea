import { defineTable } from "convex/server";
import { v } from "convex/values";

export const dailyQuestsTable = defineTable({
  date: v.string(),
  quizId: v.id("quizzes"),
  streakPoints: v.number(),
}).index("by_date", ["date"]);
