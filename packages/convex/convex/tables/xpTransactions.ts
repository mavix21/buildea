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
      workshopId: v.optional(v.id("workshops")),
    }),
    v.object({ type: v.literal("module"), moduleId: v.id("courseModules") }),
    v.object({ type: v.literal("dailyTask"), date: v.string() }),
    v.object({
      type: v.literal("workshop_assignment"),
      workshopId: v.id("workshops"),
      assignmentId: v.id("workshopAssignments"),
      submissionId: v.id("assignmentSubmissions"),
    }),
    v.object({
      type: v.literal("workshop_attendance"),
      workshopId: v.id("workshops"),
      attendanceId: v.id("workshopAttendance"),
    }),
    // Future sources can be added here
  ),

  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_user_createdAt", ["userId", "createdAt"]);
