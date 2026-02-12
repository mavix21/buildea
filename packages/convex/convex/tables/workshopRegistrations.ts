import { defineTable } from "convex/server";
import { v } from "convex/values";

// ── Registration status ──────────────────────────────────────────────
// "registered" is the single final state for "can attend" across ALL modes.
//   open        → registered
//   capped      → registered | waitlisted | cancelled
//   approval    → pending_approval → registered | rejected | cancelled
//   level_gated → registered | rejected (level too low) | cancelled
//
// No "approved" state — approval transitions directly to "registered"
// to eliminate the duplicate "can attend" semantics.
export const registrationStatusValidator = v.union(
  v.literal("registered"),
  v.literal("waitlisted"),
  v.literal("pending_approval"),
  v.literal("rejected"),
  v.literal("cancelled"),
);

// ── Workshop registrations table ─────────────────────────────────────
export const workshopRegistrationsTable = defineTable({
  workshopId: v.id("workshops"),
  userId: v.id("users"),
  status: registrationStatusValidator,
  registeredAt: v.number(),
})
  .index("by_workshopId", ["workshopId"])
  .index("by_userId", ["userId"])
  .index("by_workshopId_and_userId", ["workshopId", "userId"])
  .index("by_workshopId_and_status", ["workshopId", "status"]);
