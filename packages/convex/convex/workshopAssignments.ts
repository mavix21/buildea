import { v } from "convex/values";

import { Doc } from "./_generated/dataModel";
import { mutation, MutationCtx, query } from "./_generated/server";
import { assertWorkshopOrganizer, getCurrentAppUser } from "./lib/workshopAuth";
import { assignmentTypeValidator } from "./tables/workshopAssignments";

const assignmentValidator = v.object({
  _id: v.id("workshopAssignments"),
  _creationTime: v.number(),
  workshopId: v.id("workshops"),
  title: v.string(),
  description: v.string(),
  order: v.number(),
  deadline: v.number(),
  xpReward: v.number(),
  assignmentType: assignmentTypeValidator,
});

const assignmentListItemValidator = v.object({
  assignment: assignmentValidator,
  mySubmission: v.union(
    v.null(),
    v.object({
      submissionId: v.id("assignmentSubmissions"),
      status: v.union(
        v.literal("submitted"),
        v.literal("approved"),
        v.literal("rejected"),
      ),
      submittedAt: v.number(),
    }),
  ),
});

function assertValidAssignment(deadline: number, xpReward: number): void {
  if (deadline <= 0) {
    throw new Error("deadline must be a valid timestamp");
  }

  if (xpReward < 0) {
    throw new Error("xpReward cannot be negative");
  }
}

async function getNextOrder(
  ctx: MutationCtx,
  workshopId: Doc<"workshops">["_id"],
): Promise<number> {
  const assignments = await ctx.db
    .query("workshopAssignments")
    .withIndex("by_workshopId", (q) => q.eq("workshopId", workshopId))
    .collect();

  let maxOrder = -1;
  for (const assignment of assignments) {
    if (assignment.order > maxOrder) {
      maxOrder = assignment.order;
    }
  }

  return maxOrder + 1;
}

export const create = mutation({
  args: {
    workshopId: v.id("workshops"),
    title: v.string(),
    description: v.string(),
    order: v.optional(v.number()),
    deadline: v.number(),
    xpReward: v.number(),
    assignmentType: assignmentTypeValidator,
  },
  returns: v.id("workshopAssignments"),
  handler: async (ctx, args) => {
    await assertWorkshopOrganizer(ctx, args.workshopId);
    assertValidAssignment(args.deadline, args.xpReward);

    const order =
      args.order !== undefined
        ? args.order
        : await getNextOrder(ctx, args.workshopId);

    return await ctx.db.insert("workshopAssignments", {
      workshopId: args.workshopId,
      title: args.title,
      description: args.description,
      order,
      deadline: args.deadline,
      xpReward: args.xpReward,
      assignmentType: args.assignmentType,
    });
  },
});

export const update = mutation({
  args: {
    assignmentId: v.id("workshopAssignments"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
    deadline: v.optional(v.number()),
    xpReward: v.optional(v.number()),
    assignmentType: v.optional(assignmentTypeValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    await assertWorkshopOrganizer(ctx, assignment.workshopId);

    const nextDeadline = args.deadline ?? assignment.deadline;
    const nextXpReward = args.xpReward ?? assignment.xpReward;
    assertValidAssignment(nextDeadline, nextXpReward);

    const patch: {
      title?: string;
      description?: string;
      order?: number;
      deadline?: number;
      xpReward?: number;
      assignmentType?: Doc<"workshopAssignments">["assignmentType"];
    } = {};

    if (args.title !== undefined) {
      patch.title = args.title;
    }
    if (args.description !== undefined) {
      patch.description = args.description;
    }
    if (args.order !== undefined) {
      patch.order = args.order;
    }
    if (args.deadline !== undefined) {
      patch.deadline = args.deadline;
    }
    if (args.xpReward !== undefined) {
      patch.xpReward = args.xpReward;
    }
    if (args.assignmentType !== undefined) {
      patch.assignmentType = args.assignmentType;
    }

    await ctx.db.patch(args.assignmentId, patch);

    return null;
  },
});

export const deleteAssignment = mutation({
  args: {
    assignmentId: v.id("workshopAssignments"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    await assertWorkshopOrganizer(ctx, assignment.workshopId);

    const submissions = await ctx.db
      .query("assignmentSubmissions")
      .withIndex("by_assignmentId", (q) =>
        q.eq("assignmentId", args.assignmentId),
      )
      .collect();

    for (const submission of submissions) {
      await ctx.db.delete(submission._id);
    }

    await ctx.db.delete(args.assignmentId);

    return null;
  },
});

export const list = query({
  args: {
    workshopId: v.id("workshops"),
  },
  returns: v.array(assignmentListItemValidator),
  handler: async (ctx, args) => {
    const appUser = await getCurrentAppUser(ctx);

    const assignments = await ctx.db
      .query("workshopAssignments")
      .withIndex("by_workshopId", (q) => q.eq("workshopId", args.workshopId))
      .collect();

    assignments.sort((a, b) => a.order - b.order);

    const submissions = await ctx.db
      .query("assignmentSubmissions")
      .withIndex("by_workshopId_and_userId", (q) =>
        q.eq("workshopId", args.workshopId).eq("userId", appUser._id),
      )
      .collect();

    const submissionsByAssignmentId: Record<
      string,
      Doc<"assignmentSubmissions">
    > = {};
    for (const submission of submissions) {
      submissionsByAssignmentId[submission.assignmentId] = submission;
    }

    return assignments.map((assignment) => {
      const submission = submissionsByAssignmentId[assignment._id];
      const mySubmission =
        submission === undefined
          ? null
          : {
              submissionId: submission._id,
              status: submission.status.type,
              submittedAt: submission.submittedAt,
            };

      return {
        assignment,
        mySubmission,
      };
    });
  },
});
