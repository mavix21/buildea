import { defineTable } from "convex/server";
import { v } from "convex/values";

export const arcadesTable = defineTable({
  title: v.string(),
  slug: v.string(),
  image: v.id("_storage"),
  description: v.string(),
}).index("by_slug", ["slug"]);
