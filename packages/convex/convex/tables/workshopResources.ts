import { defineTable } from "convex/server";
import { v } from "convex/values";

// ── Resource content ─────────────────────────────────────────────────
// Each variant carries only the fields relevant to its type.
export const resourceContentValidator = v.union(
  v.object({
    type: v.literal("file"),
    fileId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(), // bytes
    mimeType: v.optional(v.string()),
  }),
  v.object({
    type: v.literal("link"),
    url: v.string(),
  }),
  v.object({
    type: v.literal("richtext"),
    body: v.string(), // Markdown
  }),
);

// ── Workshop resources table ─────────────────────────────────────────
export const workshopResourcesTable = defineTable({
  workshopId: v.id("workshops"),
  title: v.string(),
  description: v.optional(v.string()),
  order: v.number(),
  content: resourceContentValidator,
}).index("by_workshopId", ["workshopId"]);
