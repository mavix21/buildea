import { defineTable } from "convex/server";
import { v } from "convex/values";

export const workshopsTable = defineTable({
  title: v.string(),
  image: v.id("_storage"),
  description: v.string(),
  startDate: v.number(),
  endDate: v.number(),
  creatorId: v.id("users"),
  communityId: v.id("communities"),
  location: v.union(
    v.object({
      type: v.literal("online"),
      link: v.string(),
    }),
    v.object({
      type: v.literal("in-person"),
      address: v.string(),
      instructions: v.optional(v.string()),
    }),
  ),
  publicationState: v.union(
    v.object({
      type: v.literal("draft"),
    }),
    v.object({
      type: v.literal("published"),
    }),
    v.object({
      type: v.literal("scheduled"),
      scheduledAt: v.number(),
    }),
  ),
  coHosts: v.array(v.id("users")),

  quizzes: v.array(
    v.object({
      quizId: v.id("quizzes"),
      label: v.optional(v.string()),
    }),
  ),

  registrationCount: v.number(),
  recentRegistrations: v.array(v.id("users")),
})
  .index("by_communityId", ["communityId"])
  .searchIndex("search_workshops", {
    searchField: "title",
  });
