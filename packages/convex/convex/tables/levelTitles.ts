import { defineTable } from "convex/server";
import { v } from "convex/values";

export const levelTitlesTable = defineTable({
  minLevel: v.number(),
  maxLevel: v.optional(v.number()), // undefined = open-ended (infinity)
  title: v.string(),
}).index("by_minLevel", ["minLevel"]);
