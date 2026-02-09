import { defineTable } from "convex/server";
import { v } from "convex/values";

export const xpConfigTable = defineTable({
  // Quiz difficulty XP values
  difficultyXp: v.object({
    easy: v.number(),
    intermediate: v.number(),
    hard: v.number(),
    insane: v.number(),
  }),

  // Level formula config
  levelFormula: v.object({
    type: v.literal("quadratic"),
    base: v.number(), // xpForLevel = base * level²
  }),
});
