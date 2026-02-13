import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { mutation, MutationCtx, query } from "./_generated/server";
import { assertWorkshopOrganizer, getCurrentAppUser } from "./lib/workshopAuth";
import { registrationStatusValidator } from "./tables/workshopRegistrations";

const registrationValidator = v.object({
  _id: v.id("workshopRegistrations"),
  _creationTime: v.number(),
  workshopId: v.id("workshops"),
  userId: v.id("users"),
  status: registrationStatusValidator,
  registeredAt: v.number(),
});

const paginatedRegistrationsValidator = v.object({
  page: v.array(registrationValidator),
  isDone: v.boolean(),
  continueCursor: v.string(),
});

function assertWorkshopPublished(workshop: Doc<"workshops">): void {
  if (workshop.publicationState.type !== "published") {
    throw new Error("Workshop is not open for registration");
  }
}

function getCapacityLimit(workshop: Doc<"workshops">): number | null {
  const mode = workshop.registrationMode;
  if (!mode) {
    return null;
  }

  if (mode.type === "capped") {
    return mode.maxCapacity;
  }

  if (mode.type === "approval") {
    return mode.maxCapacity ?? null;
  }

  if (mode.type === "level_gated") {
    return mode.maxCapacity ?? null;
  }

  return null;
}

function isAtCapacity(workshop: Doc<"workshops">): boolean {
  const limit = getCapacityLimit(workshop);
  if (limit === null) {
    return false;
  }
  return workshop.registrationCount >= limit;
}

async function updateWorkshopRegistrationCount(
  ctx: MutationCtx,
  workshop: Doc<"workshops">,
  nextCount: number,
): Promise<void> {
  if (nextCount < 0) {
    throw new Error("Registration count cannot be negative");
  }

  if (nextCount === workshop.registrationCount) {
    return;
  }

  await ctx.db.patch(workshop._id, {
    registrationCount: nextCount,
  });
}

export const register = mutation({
  args: {
    workshopId: v.id("workshops"),
  },
  returns: v.object({
    registrationId: v.id("workshopRegistrations"),
    status: registrationStatusValidator,
  }),
  handler: async (ctx, args) => {
    const appUser = await getCurrentAppUser(ctx);
    const workshop = await ctx.db.get(args.workshopId);

    if (!workshop) {
      throw new Error("Workshop not found");
    }

    assertWorkshopPublished(workshop);

    if (!workshop.registrationMode) {
      throw new Error("Registration mode is not configured");
    }

    const existingRegistration = await ctx.db
      .query("workshopRegistrations")
      .withIndex("by_workshopId_and_userId", (q) =>
        q.eq("workshopId", args.workshopId).eq("userId", appUser._id),
      )
      .unique();

    if (
      existingRegistration &&
      (existingRegistration.status === "registered" ||
        existingRegistration.status === "waitlisted" ||
        existingRegistration.status === "pending_approval")
    ) {
      throw new Error("You already have an active registration");
    }

    let nextStatus: Doc<"workshopRegistrations">["status"];
    let shouldIncrementRegistrationCount = false;

    if (workshop.registrationMode.type === "open") {
      nextStatus = "registered";
      shouldIncrementRegistrationCount = true;
    } else if (workshop.registrationMode.type === "capped") {
      if (!isAtCapacity(workshop)) {
        nextStatus = "registered";
        shouldIncrementRegistrationCount = true;
      } else if (workshop.registrationMode.waitlistEnabled) {
        nextStatus = "waitlisted";
      } else {
        throw new Error("Workshop is at capacity");
      }
    } else if (workshop.registrationMode.type === "approval") {
      nextStatus = "pending_approval";
    } else {
      const levelInfo = await ctx.runQuery(api.xp.getUserLevelInfo, {});
      if (levelInfo.level < workshop.registrationMode.minLevel) {
        nextStatus = "rejected";
      } else if (isAtCapacity(workshop)) {
        throw new Error("Workshop is at capacity");
      } else {
        nextStatus = "registered";
        shouldIncrementRegistrationCount = true;
      }
    }

    const now = Date.now();

    if (shouldIncrementRegistrationCount) {
      await updateWorkshopRegistrationCount(
        ctx,
        workshop,
        workshop.registrationCount + 1,
      );
    }

    if (existingRegistration) {
      await ctx.db.patch(existingRegistration._id, {
        status: nextStatus,
        registeredAt: now,
      });

      return {
        registrationId: existingRegistration._id,
        status: nextStatus,
      };
    }

    const registrationId = await ctx.db.insert("workshopRegistrations", {
      workshopId: args.workshopId,
      userId: appUser._id,
      status: nextStatus,
      registeredAt: now,
    });

    return {
      registrationId,
      status: nextStatus,
    };
  },
});

export const cancelRegistration = mutation({
  args: {
    workshopId: v.id("workshops"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const appUser = await getCurrentAppUser(ctx);

    const workshop = await ctx.db.get(args.workshopId);
    if (!workshop) {
      throw new Error("Workshop not found");
    }

    const registration = await ctx.db
      .query("workshopRegistrations")
      .withIndex("by_workshopId_and_userId", (q) =>
        q.eq("workshopId", args.workshopId).eq("userId", appUser._id),
      )
      .unique();

    if (!registration) {
      throw new Error("Registration not found");
    }

    if (registration.status === "cancelled") {
      return null;
    }

    await ctx.db.patch(registration._id, {
      status: "cancelled",
    });

    let nextCount = workshop.registrationCount;
    const releasedSeat = registration.status === "registered";
    if (releasedSeat) {
      nextCount = Math.max(0, nextCount - 1);
    }

    if (
      releasedSeat &&
      workshop.registrationMode?.type === "capped" &&
      workshop.registrationMode.waitlistEnabled
    ) {
      const waitlistedRegistrations = await ctx.db
        .query("workshopRegistrations")
        .withIndex("by_workshopId_and_status", (q) =>
          q.eq("workshopId", args.workshopId).eq("status", "waitlisted"),
        )
        .collect();

      waitlistedRegistrations.sort((a, b) => a.registeredAt - b.registeredAt);

      const nextFromWaitlist = waitlistedRegistrations[0];
      if (nextFromWaitlist) {
        await ctx.db.patch(nextFromWaitlist._id, {
          status: "registered",
        });
        nextCount += 1;
      }
    }

    await updateWorkshopRegistrationCount(ctx, workshop, nextCount);

    return null;
  },
});

export const approveRegistration = mutation({
  args: {
    registrationId: v.id("workshopRegistrations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) {
      throw new Error("Registration not found");
    }

    const { workshop } = await assertWorkshopOrganizer(
      ctx,
      registration.workshopId,
    );

    if (workshop.registrationMode?.type !== "approval") {
      throw new Error(
        "Registration approval is only available for approval mode",
      );
    }

    if (registration.status !== "pending_approval") {
      throw new Error("Only pending registrations can be approved");
    }

    const capacity = workshop.registrationMode.maxCapacity;
    if (capacity !== undefined && workshop.registrationCount >= capacity) {
      throw new Error("Workshop is at capacity");
    }

    await ctx.db.patch(registration._id, {
      status: "registered",
    });

    await updateWorkshopRegistrationCount(
      ctx,
      workshop,
      workshop.registrationCount + 1,
    );

    return null;
  },
});

export const rejectRegistration = mutation({
  args: {
    registrationId: v.id("workshopRegistrations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) {
      throw new Error("Registration not found");
    }

    await assertWorkshopOrganizer(ctx, registration.workshopId);

    if (registration.status !== "pending_approval") {
      throw new Error("Only pending registrations can be rejected");
    }

    await ctx.db.patch(registration._id, {
      status: "rejected",
    });

    return null;
  },
});

export const getMyRegistration = query({
  args: {
    workshopId: v.id("workshops"),
  },
  returns: v.union(v.null(), registrationValidator),
  handler: async (ctx, args) => {
    const appUser = await getCurrentAppUser(ctx);

    return await ctx.db
      .query("workshopRegistrations")
      .withIndex("by_workshopId_and_userId", (q) =>
        q.eq("workshopId", args.workshopId).eq("userId", appUser._id),
      )
      .unique();
  },
});

export const listRegistrations = query({
  args: {
    workshopId: v.id("workshops"),
    status: v.optional(registrationStatusValidator),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginatedRegistrationsValidator,
  handler: async (ctx, args) => {
    await assertWorkshopOrganizer(ctx, args.workshopId);

    const { status } = args;

    if (status !== undefined) {
      return await ctx.db
        .query("workshopRegistrations")
        .withIndex("by_workshopId_and_status", (q) =>
          q.eq("workshopId", args.workshopId).eq("status", status),
        )
        .paginate(args.paginationOpts);
    }

    return await ctx.db
      .query("workshopRegistrations")
      .withIndex("by_workshopId", (q) => q.eq("workshopId", args.workshopId))
      .paginate(args.paginationOpts);
  },
});
