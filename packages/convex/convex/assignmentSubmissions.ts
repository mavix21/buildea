import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { Doc } from "./_generated/dataModel";
import { mutation, MutationCtx, query } from "./_generated/server";
import { assertWorkshopOrganizer, getCurrentAppUser } from "./lib/workshopAuth";
import {
  submissionContentValidator,
  submissionStatusValidator,
} from "./tables/assignmentSubmissions";
import { awardXp } from "./xp";

const submissionValidator = v.object({
  _id: v.id("assignmentSubmissions"),
  _creationTime: v.number(),
  assignmentId: v.id("workshopAssignments"),
  workshopId: v.id("workshops"),
  userId: v.id("users"),
  submittedAt: v.number(),
  content: submissionContentValidator,
  status: submissionStatusValidator,
});

const paginatedSubmissionsValidator = v.object({
  page: v.array(submissionValidator),
  isDone: v.boolean(),
  continueCursor: v.string(),
});

function isApprovedSubmission(
  submission: Doc<"assignmentSubmissions">,
): boolean {
  return submission.status.type === "approved";
}

async function assertRegisteredAndAttended(
  ctx: MutationCtx,
  workshopId: Doc<"workshops">["_id"],
  userId: Doc<"users">["_id"],
): Promise<void> {
  const registration = await ctx.db
    .query("workshopRegistrations")
    .withIndex("by_workshopId_and_userId", (q) =>
      q.eq("workshopId", workshopId).eq("userId", userId),
    )
    .unique();

  if (!registration || registration.status !== "registered") {
    throw new Error("You must be registered for this workshop");
  }

  const attendance = await ctx.db
    .query("workshopAttendance")
    .withIndex("by_workshopId_and_userId", (q) =>
      q.eq("workshopId", workshopId).eq("userId", userId),
    )
    .unique();

  if (!attendance) {
    throw new Error("You must check in before submitting assignments");
  }
}

function assertSubmissionMatchesAssignmentType(
  assignment: Doc<"workshopAssignments">,
  content: Doc<"assignmentSubmissions">["content"],
): void {
  if (assignment.assignmentType.type !== content.type) {
    throw new Error("Submission type does not match assignment type");
  }
}

async function validateFileUploadSubmission(
  ctx: MutationCtx,
  assignment: Doc<"workshopAssignments">,
  content: Doc<"assignmentSubmissions">["content"],
): Promise<void> {
  if (content.type !== "file_upload") {
    return;
  }

  if (assignment.assignmentType.type !== "file_upload") {
    throw new Error("Submission type does not match assignment type");
  }

  const { acceptedFormats, maxFileSizeMb } = assignment.assignmentType;

  if (acceptedFormats && acceptedFormats.length > 0) {
    const normalizedName = content.fileName.toLowerCase();
    const hasAcceptedExtension = acceptedFormats.some((format) =>
      normalizedName.endsWith(format.toLowerCase()),
    );

    if (!hasAcceptedExtension) {
      throw new Error("File format is not allowed for this assignment");
    }
  }

  if (maxFileSizeMb !== undefined) {
    const metadata = await ctx.db.system.get("_storage", content.fileId);
    if (!metadata) {
      throw new Error("Uploaded file not found");
    }

    const maxBytes = maxFileSizeMb * 1024 * 1024;
    if (metadata.size > maxBytes) {
      throw new Error("Uploaded file exceeds maximum allowed size");
    }
  }
}

async function validateQuizSubmission(
  ctx: MutationCtx,
  assignment: Doc<"workshopAssignments">,
  content: Doc<"assignmentSubmissions">["content"],
  userId: Doc<"users">["_id"],
): Promise<void> {
  if (content.type !== "quiz") {
    return;
  }

  if (assignment.assignmentType.type !== "quiz") {
    throw new Error("Submission type does not match assignment type");
  }

  const quizSubmission = await ctx.db.get(content.quizSubmissionId);
  if (!quizSubmission) {
    throw new Error("Quiz submission not found");
  }

  if (quizSubmission.userId !== userId) {
    throw new Error("Quiz submission does not belong to the current user");
  }

  if (quizSubmission.quizId !== assignment.assignmentType.quizId) {
    throw new Error("Quiz submission does not match assignment quiz");
  }

  if (quizSubmission.source.type !== "workshop") {
    throw new Error("Quiz submission source is not a workshop");
  }

  if (quizSubmission.source.workshopId !== assignment.workshopId) {
    throw new Error(
      "Quiz submission workshop does not match assignment workshop",
    );
  }
}

export const submit = mutation({
  args: {
    assignmentId: v.id("workshopAssignments"),
    content: submissionContentValidator,
  },
  returns: v.id("assignmentSubmissions"),
  handler: async (ctx, args) => {
    const appUser = await getCurrentAppUser(ctx);

    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    await assertRegisteredAndAttended(ctx, assignment.workshopId, appUser._id);

    if (Date.now() > assignment.deadline) {
      throw new Error("Assignment deadline has passed");
    }

    assertSubmissionMatchesAssignmentType(assignment, args.content);
    await validateFileUploadSubmission(ctx, assignment, args.content);
    await validateQuizSubmission(ctx, assignment, args.content, appUser._id);

    const existingSubmission = await ctx.db
      .query("assignmentSubmissions")
      .withIndex("by_assignmentId_and_userId", (q) =>
        q.eq("assignmentId", args.assignmentId).eq("userId", appUser._id),
      )
      .unique();

    if (existingSubmission && isApprovedSubmission(existingSubmission)) {
      throw new Error(
        "An approved submission already exists for this assignment",
      );
    }

    const now = Date.now();

    if (existingSubmission) {
      await ctx.db.patch(existingSubmission._id, {
        content: args.content,
        submittedAt: now,
        status: { type: "submitted" },
      });

      return existingSubmission._id;
    }

    return await ctx.db.insert("assignmentSubmissions", {
      assignmentId: args.assignmentId,
      workshopId: assignment.workshopId,
      userId: appUser._id,
      submittedAt: now,
      content: args.content,
      status: { type: "submitted" },
    });
  },
});

export const getMySubmission = query({
  args: {
    assignmentId: v.id("workshopAssignments"),
  },
  returns: v.union(v.null(), submissionValidator),
  handler: async (ctx, args) => {
    const appUser = await getCurrentAppUser(ctx);

    return await ctx.db
      .query("assignmentSubmissions")
      .withIndex("by_assignmentId_and_userId", (q) =>
        q.eq("assignmentId", args.assignmentId).eq("userId", appUser._id),
      )
      .unique();
  },
});

export const listForAssignment = query({
  args: {
    assignmentId: v.id("workshopAssignments"),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginatedSubmissionsValidator,
  handler: async (ctx, args) => {
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    await assertWorkshopOrganizer(ctx, assignment.workshopId);

    return await ctx.db
      .query("assignmentSubmissions")
      .withIndex("by_assignmentId", (q) =>
        q.eq("assignmentId", args.assignmentId),
      )
      .paginate(args.paginationOpts);
  },
});

export const listMyWorkshopSubmissions = query({
  args: {
    workshopId: v.id("workshops"),
  },
  returns: v.array(submissionValidator),
  handler: async (ctx, args) => {
    const appUser = await getCurrentAppUser(ctx);

    return await ctx.db
      .query("assignmentSubmissions")
      .withIndex("by_workshopId_and_userId", (q) =>
        q.eq("workshopId", args.workshopId).eq("userId", appUser._id),
      )
      .collect();
  },
});

export const review = mutation({
  args: {
    submissionId: v.id("assignmentSubmissions"),
    decision: v.union(v.literal("approved"), v.literal("rejected")),
    feedback: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const reviewer = await getCurrentAppUser(ctx);

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    const assignment = await ctx.db.get(submission.assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    await assertWorkshopOrganizer(ctx, assignment.workshopId);

    if (args.decision === "approved") {
      if (submission.status.type === "approved") {
        throw new Error("Submission is already approved");
      }

      const reviewedAt = Date.now();

      await ctx.db.patch(submission._id, {
        status: {
          type: "approved",
          reviewedAt,
          reviewedBy: reviewer._id,
          feedback: args.feedback,
          xpAwarded: assignment.xpReward,
        },
      });

      await awardXp(ctx, {
        userId: submission.userId,
        amount: assignment.xpReward,
        source: {
          type: "workshop_assignment",
          workshopId: submission.workshopId,
          assignmentId: assignment._id,
          submissionId: submission._id,
        },
      });
    } else {
      await ctx.db.patch(submission._id, {
        status: {
          type: "rejected",
          reviewedAt: Date.now(),
          reviewedBy: reviewer._id,
          feedback: args.feedback,
        },
      });
    }

    return null;
  },
});
