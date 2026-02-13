import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { components } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { Doc as BetterAuthDoc } from "./betterAuth/_generated/dataModel";
import {
  assertCommunityMember,
  assertWorkshopOrganizer,
} from "./lib/workshopAuth";
import { registrationModeValidator } from "./tables/workshops";

const workshopCardValidator = v.object({
  _id: v.id("workshops"),
  _creationTime: v.number(),
  title: v.string(),
  description: v.string(),
  startDate: v.number(),
  endDate: v.number(),
  communityId: v.id("communities"),
  creatorId: v.id("users"),
  tags: v.array(v.string()),
  registrationCount: v.number(),
  publicationStateType: v.union(
    v.literal("draft"),
    v.literal("scheduled"),
    v.literal("published"),
    v.literal("archived"),
  ),
  imageUrl: v.union(v.string(), v.null()),
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
  community: v.object({
    id: v.id("communities"),
    orgId: v.string(),
    name: v.union(v.string(), v.null()),
    slug: v.union(v.string(), v.null()),
    logoUrl: v.union(v.string(), v.null()),
  }),
});

const paginatedWorkshopCardValidator = v.object({
  page: v.array(workshopCardValidator),
  isDone: v.boolean(),
  continueCursor: v.string(),
});

async function resolveWorkshopCommunity(
  ctx: QueryCtx,
  communityId: Id<"communities">,
): Promise<{
  id: Id<"communities">;
  orgId: string;
  name: string | null;
  slug: string | null;
  logoUrl: string | null;
}> {
  const community = await ctx.db.get(communityId);
  if (!community) {
    throw new Error("Community not found");
  }

  const organization: BetterAuthDoc<"organization"> | null = await ctx.runQuery(
    components.betterAuth.adapter.findOne,
    {
      model: "organization",
      where: [{ field: "_id", operator: "eq", value: community.orgId }],
    },
  );

  let logoUrl: string | null = null;
  if (community.logoId) {
    logoUrl = await ctx.storage.getUrl(community.logoId);
  }
  if (!logoUrl) {
    logoUrl = organization?.logo ?? null;
  }

  return {
    id: community._id,
    orgId: community.orgId,
    name: organization?.name ?? null,
    slug: organization?.slug ?? null,
    logoUrl,
  };
}

function assertWorkshopDates(startDate: number, endDate: number): void {
  if (endDate <= startDate) {
    throw new Error("endDate must be greater than startDate");
  }
}

function assertCanEdit(workshop: Doc<"workshops">): void {
  if (
    workshop.publicationState.type !== "draft" &&
    workshop.publicationState.type !== "published"
  ) {
    throw new Error("Workshop can only be updated in draft or published state");
  }
}

export const create = mutation({
  args: {
    communityId: v.id("communities"),
    title: v.string(),
    description: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    image: v.optional(v.id("_storage")),
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
    registrationMode: v.optional(registrationModeValidator),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.id("workshops"),
  handler: async (ctx, args) => {
    const appUser = await assertCommunityMember(ctx, args.communityId);

    assertWorkshopDates(args.startDate, args.endDate);

    return await ctx.db.insert("workshops", {
      communityId: args.communityId,
      creatorId: appUser._id,
      title: args.title,
      description: args.description,
      startDate: args.startDate,
      endDate: args.endDate,
      image: args.image,
      location: args.location,
      publicationState: { type: "draft" },
      registrationMode: args.registrationMode,
      coHosts: [],
      tags: args.tags ?? [],
      checkInCode: undefined,
      registrationCount: 0,
      recentRegistrations: [],
    });
  },
});

export const update = mutation({
  args: {
    workshopId: v.id("workshops"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    image: v.optional(v.id("_storage")),
    location: v.optional(
      v.union(
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
    ),
    registrationMode: v.optional(registrationModeValidator),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { workshop } = await assertWorkshopOrganizer(ctx, args.workshopId);
    assertCanEdit(workshop);

    const nextStartDate = args.startDate ?? workshop.startDate;
    const nextEndDate = args.endDate ?? workshop.endDate;
    assertWorkshopDates(nextStartDate, nextEndDate);

    const patch: {
      title?: string;
      description?: string;
      startDate?: number;
      endDate?: number;
      image?: Id<"_storage">;
      location?: Doc<"workshops">["location"];
      registrationMode?: Doc<"workshops">["registrationMode"];
      tags?: Array<string>;
    } = {};

    if (args.title !== undefined) {
      patch.title = args.title;
    }
    if (args.description !== undefined) {
      patch.description = args.description;
    }
    if (args.startDate !== undefined) {
      patch.startDate = args.startDate;
    }
    if (args.endDate !== undefined) {
      patch.endDate = args.endDate;
    }
    if (args.image !== undefined) {
      patch.image = args.image;
    }
    if (args.location !== undefined) {
      patch.location = args.location;
    }
    if (args.registrationMode !== undefined) {
      patch.registrationMode = args.registrationMode;
    }
    if (args.tags !== undefined) {
      patch.tags = args.tags;
    }

    await ctx.db.patch(args.workshopId, patch);
    return null;
  },
});

export const get = query({
  args: {
    workshopId: v.id("workshops"),
  },
  handler: async (ctx, args) => {
    const workshop = await ctx.db.get(args.workshopId);
    if (!workshop) {
      return null;
    }

    const creator = await ctx.db.get(workshop.creatorId);
    const community = await ctx.db.get(workshop.communityId);
    if (!community) {
      throw new Error("Community not found");
    }

    const authCreator: BetterAuthDoc<"user"> | null = creator
      ? await ctx.runQuery(components.betterAuth.adapter.findOne, {
          model: "user",
          where: [{ field: "_id", operator: "eq", value: creator.authId }],
        })
      : null;
    const organization: BetterAuthDoc<"organization"> | null =
      await ctx.runQuery(components.betterAuth.adapter.findOne, {
        model: "organization",
        where: [{ field: "_id", operator: "eq", value: community.orgId }],
      });

    let creatorImageUrl: string | null = null;
    if (creator?.avatarImageId) {
      creatorImageUrl = await ctx.storage.getUrl(creator.avatarImageId);
    }
    if (!creatorImageUrl) {
      creatorImageUrl = authCreator?.image ?? null;
    }

    let logoUrl: string | null = null;
    if (community.logoId) {
      logoUrl = await ctx.storage.getUrl(community.logoId);
    }
    if (!logoUrl) {
      logoUrl = organization?.logo ?? null;
    }

    return {
      _id: workshop._id,
      _creationTime: workshop._creationTime,
      title: workshop.title,
      description: workshop.description,
      startDate: workshop.startDate,
      endDate: workshop.endDate,
      image: workshop.image,
      location: workshop.location,
      publicationStateType: workshop.publicationState.type,
      registrationMode: workshop.registrationMode,
      coHosts: workshop.coHosts,
      tags: workshop.tags,
      registrationCount: workshop.registrationCount,
      checkInCodeSet: workshop.checkInCode !== undefined,
      creator: {
        id: workshop.creatorId,
        name: authCreator?.name ?? null,
        imageUrl: creatorImageUrl,
      },
      community: {
        id: community._id,
        orgId: community.orgId,
        name: organization?.name ?? null,
        slug: organization?.slug ?? null,
        description: community.description ?? null,
        logoUrl,
      },
    };
  },
});

export const publish = mutation({
  args: {
    workshopId: v.id("workshops"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { workshop } = await assertWorkshopOrganizer(ctx, args.workshopId);

    if (workshop.publicationState.type !== "draft") {
      throw new Error("Only draft workshops can be published");
    }

    if (!workshop.image) {
      throw new Error("Workshop image is required before publishing");
    }
    if (!workshop.registrationMode) {
      throw new Error("Registration mode is required before publishing");
    }
    assertWorkshopDates(workshop.startDate, workshop.endDate);

    await ctx.db.patch(args.workshopId, {
      publicationState: { type: "published" },
    });

    return null;
  },
});

export const archive = mutation({
  args: {
    workshopId: v.id("workshops"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { workshop } = await assertWorkshopOrganizer(ctx, args.workshopId);

    if (workshop.publicationState.type === "archived") {
      throw new Error("Workshop is already archived");
    }

    if (workshop.publicationState.type !== "published") {
      throw new Error("Only published workshops can be archived");
    }

    if (Date.now() <= workshop.endDate) {
      throw new Error("Workshop can only be archived after it has ended");
    }

    await ctx.db.patch(args.workshopId, {
      publicationState: { type: "archived" },
    });

    return null;
  },
});

export const deleteWorkshop = mutation({
  args: {
    workshopId: v.id("workshops"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { workshop } = await assertWorkshopOrganizer(ctx, args.workshopId);

    if (workshop.publicationState.type !== "draft") {
      throw new Error("Only draft workshops can be deleted");
    }

    const resources = await ctx.db
      .query("workshopResources")
      .withIndex("by_workshopId", (q) => q.eq("workshopId", args.workshopId))
      .collect();
    for (const resource of resources) {
      await ctx.db.delete(resource._id);
    }

    const assignments = await ctx.db
      .query("workshopAssignments")
      .withIndex("by_workshopId", (q) => q.eq("workshopId", args.workshopId))
      .collect();

    for (const assignment of assignments) {
      const submissions = await ctx.db
        .query("assignmentSubmissions")
        .withIndex("by_assignmentId", (q) =>
          q.eq("assignmentId", assignment._id),
        )
        .collect();

      for (const submission of submissions) {
        await ctx.db.delete(submission._id);
      }

      await ctx.db.delete(assignment._id);
    }

    const registrations = await ctx.db
      .query("workshopRegistrations")
      .withIndex("by_workshopId", (q) => q.eq("workshopId", args.workshopId))
      .collect();
    for (const registration of registrations) {
      await ctx.db.delete(registration._id);
    }

    const attendance = await ctx.db
      .query("workshopAttendance")
      .withIndex("by_workshopId", (q) => q.eq("workshopId", args.workshopId))
      .collect();
    for (const attendee of attendance) {
      await ctx.db.delete(attendee._id);
    }

    await ctx.db.delete(args.workshopId);
    return null;
  },
});

export const listByCommunity = query({
  args: {
    communityId: v.id("communities"),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginatedWorkshopCardValidator,
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("workshops")
      .withIndex("by_communityId_and_startDate", (q) =>
        q.eq("communityId", args.communityId),
      )
      .order("asc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      result.page.map(async (workshop) => {
        const community = await resolveWorkshopCommunity(
          ctx,
          workshop.communityId,
        );

        return {
          _id: workshop._id,
          _creationTime: workshop._creationTime,
          title: workshop.title,
          description: workshop.description,
          startDate: workshop.startDate,
          endDate: workshop.endDate,
          communityId: workshop.communityId,
          creatorId: workshop.creatorId,
          tags: workshop.tags,
          registrationCount: workshop.registrationCount,
          publicationStateType: workshop.publicationState.type,
          imageUrl: workshop.image
            ? await ctx.storage.getUrl(workshop.image)
            : null,
          location: workshop.location,
          community,
        };
      }),
    );

    return {
      page,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});

export const listUpcoming = query({
  args: {
    paginationOpts: paginationOptsValidator,
    now: v.optional(v.number()),
  },
  returns: paginatedWorkshopCardValidator,
  handler: async (ctx, args) => {
    const now = args.now ?? Date.now();

    const result = await ctx.db
      .query("workshops")
      .withIndex("by_publicationState_and_startDate", (q) =>
        q.eq("publicationState.type", "published").gt("startDate", now),
      )
      .order("asc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      result.page.map(async (workshop) => {
        const community = await resolveWorkshopCommunity(
          ctx,
          workshop.communityId,
        );

        return {
          _id: workshop._id,
          _creationTime: workshop._creationTime,
          title: workshop.title,
          description: workshop.description,
          startDate: workshop.startDate,
          endDate: workshop.endDate,
          communityId: workshop.communityId,
          creatorId: workshop.creatorId,
          tags: workshop.tags,
          registrationCount: workshop.registrationCount,
          publicationStateType: workshop.publicationState.type,
          imageUrl: workshop.image
            ? await ctx.storage.getUrl(workshop.image)
            : null,
          location: workshop.location,
          community,
        };
      }),
    );

    return {
      page,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});

export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    now: v.optional(v.number()),
  },
  returns: v.array(workshopCardValidator),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const now = args.now ?? Date.now();
    const rawResults = await ctx.db
      .query("workshops")
      .withSearchIndex("search_workshops", (q) => q.search("title", args.query))
      .take(limit);

    const publishedResults = rawResults.filter(
      (workshop) =>
        workshop.publicationState.type === "published" &&
        workshop.startDate > now,
    );

    return await Promise.all(
      publishedResults.map(async (workshop) => {
        const community = await resolveWorkshopCommunity(
          ctx,
          workshop.communityId,
        );

        return {
          _id: workshop._id,
          _creationTime: workshop._creationTime,
          title: workshop.title,
          description: workshop.description,
          startDate: workshop.startDate,
          endDate: workshop.endDate,
          communityId: workshop.communityId,
          creatorId: workshop.creatorId,
          tags: workshop.tags,
          registrationCount: workshop.registrationCount,
          publicationStateType: workshop.publicationState.type,
          imageUrl: workshop.image
            ? await ctx.storage.getUrl(workshop.image)
            : null,
          location: workshop.location,
          community,
        };
      }),
    );
  },
});

export const addCoHost = mutation({
  args: {
    workshopId: v.id("workshops"),
    userId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { workshop } = await assertWorkshopOrganizer(ctx, args.workshopId);

    if (workshop.creatorId === args.userId) {
      throw new Error("Creator is already an organizer");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    if (workshop.coHosts.some((coHostId) => coHostId === args.userId)) {
      return null;
    }

    await ctx.db.patch(args.workshopId, {
      coHosts: [...workshop.coHosts, args.userId],
    });

    return null;
  },
});

export const removeCoHost = mutation({
  args: {
    workshopId: v.id("workshops"),
    userId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { workshop } = await assertWorkshopOrganizer(ctx, args.workshopId);

    const updatedCoHosts = workshop.coHosts.filter(
      (coHostId) => coHostId !== args.userId,
    );

    if (updatedCoHosts.length === workshop.coHosts.length) {
      return null;
    }

    await ctx.db.patch(args.workshopId, {
      coHosts: updatedCoHosts,
    });

    return null;
  },
});
