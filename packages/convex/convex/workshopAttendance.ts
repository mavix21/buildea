import { v } from "convex/values";

import { Doc } from "./_generated/dataModel";
import { mutation, MutationCtx, query } from "./_generated/server";
import { assertWorkshopOrganizer, getCurrentAppUser } from "./lib/workshopAuth";
import { awardXp } from "./xp";

const WORKSHOP_ATTENDANCE_XP = 25;

const attendanceValidator = v.object({
  _id: v.id("workshopAttendance"),
  _creationTime: v.number(),
  workshopId: v.id("workshops"),
  userId: v.id("users"),
  checkedInAt: v.number(),
  method: v.union(v.literal("code"), v.literal("manual")),
});

const attendeeViewValidator = v.object({
  attendanceId: v.id("workshopAttendance"),
  userId: v.id("users"),
  checkedInAt: v.number(),
  method: v.union(v.literal("code"), v.literal("manual")),
});

function assertWorkshopLive(workshop: Doc<"workshops">, now: number): void {
  if (workshop.publicationState.type !== "published") {
    throw new Error("Workshop must be published");
  }

  if (now < workshop.startDate || now > workshop.endDate) {
    throw new Error("Workshop is not live");
  }
}

function createCheckInCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let index = 0; index < 6; index += 1) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    code += alphabet[randomIndex];
  }

  return code;
}

async function getRegisteredRegistration(
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
    throw new Error("User must be registered to check in");
  }
}

async function awardAttendanceXp(
  ctx: MutationCtx,
  attendance: Doc<"workshopAttendance">,
): Promise<void> {
  await awardXp(ctx, {
    userId: attendance.userId,
    amount: WORKSHOP_ATTENDANCE_XP,
    source: {
      type: "workshop_attendance",
      workshopId: attendance.workshopId,
      attendanceId: attendance._id,
    },
  });
}

export const generateCheckInCode = mutation({
  args: {
    workshopId: v.id("workshops"),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const { workshop } = await assertWorkshopOrganizer(ctx, args.workshopId);

    const now = Date.now();
    assertWorkshopLive(workshop, now);

    const code = createCheckInCode();

    await ctx.db.patch(workshop._id, {
      checkInCode: code,
    });

    return code;
  },
});

export const refreshCheckInCode = mutation({
  args: {
    workshopId: v.id("workshops"),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const { workshop } = await assertWorkshopOrganizer(ctx, args.workshopId);

    const now = Date.now();
    assertWorkshopLive(workshop, now);

    const code = createCheckInCode();

    await ctx.db.patch(workshop._id, {
      checkInCode: code,
    });

    return code;
  },
});

export const checkIn = mutation({
  args: {
    workshopId: v.id("workshops"),
    code: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const appUser = await getCurrentAppUser(ctx);

    const workshop = await ctx.db.get(args.workshopId);
    if (!workshop) {
      throw new Error("Workshop not found");
    }

    const now = Date.now();
    assertWorkshopLive(workshop, now);

    await getRegisteredRegistration(ctx, workshop._id, appUser._id);

    if (!workshop.checkInCode) {
      throw new Error("Check-in code is not active");
    }

    const submittedCode = args.code.trim().toUpperCase();
    if (submittedCode !== workshop.checkInCode.toUpperCase()) {
      throw new Error("Invalid check-in code");
    }

    const existingAttendance = await ctx.db
      .query("workshopAttendance")
      .withIndex("by_workshopId_and_userId", (q) =>
        q.eq("workshopId", workshop._id).eq("userId", appUser._id),
      )
      .unique();

    if (existingAttendance) {
      return null;
    }

    const attendanceId = await ctx.db.insert("workshopAttendance", {
      workshopId: workshop._id,
      userId: appUser._id,
      checkedInAt: now,
      method: "code",
    });

    const attendance = await ctx.db.get(attendanceId);
    if (!attendance) {
      throw new Error("Attendance record not found");
    }

    await awardAttendanceXp(ctx, attendance);

    return null;
  },
});

export const manualCheckIn = mutation({
  args: {
    workshopId: v.id("workshops"),
    userId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { workshop } = await assertWorkshopOrganizer(ctx, args.workshopId);

    const now = Date.now();
    assertWorkshopLive(workshop, now);

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    await getRegisteredRegistration(ctx, workshop._id, user._id);

    const existingAttendance = await ctx.db
      .query("workshopAttendance")
      .withIndex("by_workshopId_and_userId", (q) =>
        q.eq("workshopId", workshop._id).eq("userId", user._id),
      )
      .unique();

    if (existingAttendance) {
      return null;
    }

    const attendanceId = await ctx.db.insert("workshopAttendance", {
      workshopId: workshop._id,
      userId: user._id,
      checkedInAt: now,
      method: "manual",
    });

    const attendance = await ctx.db.get(attendanceId);
    if (!attendance) {
      throw new Error("Attendance record not found");
    }

    await awardAttendanceXp(ctx, attendance);

    return null;
  },
});

export const removeAttendance = mutation({
  args: {
    attendanceId: v.id("workshopAttendance"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const attendance = await ctx.db.get(args.attendanceId);
    if (!attendance) {
      throw new Error("Attendance record not found");
    }

    await assertWorkshopOrganizer(ctx, attendance.workshopId);

    await ctx.db.delete(attendance._id);

    return null;
  },
});

export const listAttendees = query({
  args: {
    workshopId: v.id("workshops"),
  },
  returns: v.array(attendeeViewValidator),
  handler: async (ctx, args) => {
    await assertWorkshopOrganizer(ctx, args.workshopId);

    const attendance = await ctx.db
      .query("workshopAttendance")
      .withIndex("by_workshopId", (q) => q.eq("workshopId", args.workshopId))
      .collect();

    attendance.sort((a, b) => a.checkedInAt - b.checkedInAt);

    return attendance.map((row) => ({
      attendanceId: row._id,
      userId: row.userId,
      checkedInAt: row.checkedInAt,
      method: row.method,
    }));
  },
});

export const getMyAttendance = query({
  args: {
    workshopId: v.id("workshops"),
  },
  returns: v.object({
    checkedIn: v.boolean(),
    attendance: v.union(v.null(), attendanceValidator),
  }),
  handler: async (ctx, args) => {
    const appUser = await getCurrentAppUser(ctx);

    const attendance = await ctx.db
      .query("workshopAttendance")
      .withIndex("by_workshopId_and_userId", (q) =>
        q.eq("workshopId", args.workshopId).eq("userId", appUser._id),
      )
      .unique();

    return {
      checkedIn: attendance !== null,
      attendance,
    };
  },
});
