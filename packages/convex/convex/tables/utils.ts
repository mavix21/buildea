import { v } from "convex/values";

export const userAnswer = v.union(
  v.object({
    type: v.literal("single_choice"),
    selectedOptionId: v.string(),
  }),
  v.object({
    type: v.literal("multiple_choice"),
    selectedOptionIds: v.array(v.string()),
  }),
  v.object({
    type: v.literal("true_or_false"),
    value: v.boolean(),
  }),
);
