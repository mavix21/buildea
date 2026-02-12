import { defineTable } from "convex/server";
import { v } from "convex/values";

// ── Assignment type ──────────────────────────────────────────────────
// Each variant carries only the configuration relevant to that submission type.
export const assignmentTypeValidator = v.union(
  v.object({
    type: v.literal("quiz"),
    quizId: v.id("quizzes"),
  }),
  v.object({
    type: v.literal("file_upload"),
    acceptedFormats: v.optional(v.array(v.string())), // e.g. [".pdf", ".zip"]
    maxFileSizeMb: v.optional(v.number()),
  }),
  v.object({
    type: v.literal("link_submission"),
    placeholder: v.optional(v.string()), // e.g. "Paste your GitHub repo URL"
  }),
);

// ── Workshop assignments table ───────────────────────────────────────
export const workshopAssignmentsTable = defineTable({
  workshopId: v.id("workshops"),
  title: v.string(),
  description: v.string(),
  order: v.number(),
  deadline: v.number(), // Per-assignment deadline (timestamp)
  xpReward: v.number(), // XP awarded on completion/approval
  assignmentType: assignmentTypeValidator,
}).index("by_workshopId", ["workshopId"]);
