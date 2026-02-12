import { defineTable } from "convex/server";
import { v } from "convex/values";

// ── Submission content ───────────────────────────────────────────────
// Mirrors the assignment type — each variant carries the submitted artifact.
export const submissionContentValidator = v.union(
  v.object({
    type: v.literal("quiz"),
    quizSubmissionId: v.id("quizSubmissions"),
  }),
  v.object({
    type: v.literal("file_upload"),
    fileId: v.id("_storage"),
    fileName: v.string(),
  }),
  v.object({
    type: v.literal("link_submission"),
    url: v.string(),
  }),
);

// ── Submission review status ─────────────────────────────────────────
// Discriminated union makes invalid states unrepresentable:
//   - "submitted" carries no review fields.
//   - "approved"  carries review metadata + xpAwarded.
//   - "rejected"  carries review metadata but no XP.
export const submissionStatusValidator = v.union(
  v.object({ type: v.literal("submitted") }),
  v.object({
    type: v.literal("approved"),
    reviewedAt: v.number(),
    reviewedBy: v.id("users"),
    feedback: v.optional(v.string()),
    xpAwarded: v.number(),
  }),
  v.object({
    type: v.literal("rejected"),
    reviewedAt: v.number(),
    reviewedBy: v.id("users"),
    feedback: v.optional(v.string()),
  }),
);

// ── Assignment submissions table ─────────────────────────────────────
export const assignmentSubmissionsTable = defineTable({
  assignmentId: v.id("workshopAssignments"),
  workshopId: v.id("workshops"), // Denormalized for efficient queries
  userId: v.id("users"),
  submittedAt: v.number(),
  content: submissionContentValidator,
  status: submissionStatusValidator,
})
  .index("by_assignmentId", ["assignmentId"])
  .index("by_workshopId_and_userId", ["workshopId", "userId"])
  .index("by_userId", ["userId"])
  .index("by_assignmentId_and_userId", ["assignmentId", "userId"]);
