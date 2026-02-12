import { defineTable } from "convex/server";
import { v } from "convex/values";

// ── Workshop attendance table ────────────────────────────────────────
// Records proof that a builder was physically/virtually present.
// Separate from registration — a builder must be registered to check in.
export const workshopAttendanceTable = defineTable({
  workshopId: v.id("workshops"),
  userId: v.id("users"),
  checkedInAt: v.number(),
  method: v.union(v.literal("code"), v.literal("manual")),
})
  .index("by_workshopId", ["workshopId"])
  .index("by_workshopId_and_userId", ["workshopId", "userId"]);
