import { v } from "convex/values";

import { Doc } from "./_generated/dataModel";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { assertWorkshopOrganizer, getCurrentAppUser } from "./lib/workshopAuth";
import { resourceContentValidator } from "./tables/workshopResources";

const MAX_FILE_RESOURCES_FREE = 5;

const resourceValidator = v.object({
  _id: v.id("workshopResources"),
  _creationTime: v.number(),
  workshopId: v.id("workshops"),
  title: v.string(),
  description: v.optional(v.string()),
  order: v.number(),
  content: resourceContentValidator,
});

async function getNextResourceOrder(
  ctx: MutationCtx,
  workshopId: Doc<"workshops">["_id"],
): Promise<number> {
  const resources = await ctx.db
    .query("workshopResources")
    .withIndex("by_workshopId", (q) => q.eq("workshopId", workshopId))
    .collect();

  let maxOrder = -1;
  for (const resource of resources) {
    if (resource.order > maxOrder) {
      maxOrder = resource.order;
    }
  }

  return maxOrder + 1;
}

async function assertCanReadResources(
  ctx: QueryCtx,
  workshopId: Doc<"workshops">["_id"],
): Promise<void> {
  const workshop = await ctx.db.get(workshopId);
  if (!workshop) {
    throw new Error("Workshop not found");
  }

  const appUser = await getCurrentAppUser(ctx);

  const isOrganizer =
    workshop.creatorId === appUser._id ||
    workshop.coHosts.some((coHostId) => coHostId === appUser._id);

  if (isOrganizer) {
    return;
  }

  const registration = await ctx.db
    .query("workshopRegistrations")
    .withIndex("by_workshopId_and_userId", (q) =>
      q.eq("workshopId", workshopId).eq("userId", appUser._id),
    )
    .unique();

  if (!registration || registration.status !== "registered") {
    throw new Error("Only registered builders can access workshop resources");
  }
}

async function assertFileResourceLimit(
  ctx: MutationCtx,
  workshopId: Doc<"workshops">["_id"],
): Promise<void> {
  const resources = await ctx.db
    .query("workshopResources")
    .withIndex("by_workshopId", (q) => q.eq("workshopId", workshopId))
    .collect();

  const fileResourceCount = resources.filter(
    (resource) => resource.content.type === "file",
  ).length;

  if (fileResourceCount >= MAX_FILE_RESOURCES_FREE) {
    throw new Error(
      `Free plan supports up to ${MAX_FILE_RESOURCES_FREE} file resources per workshop`,
    );
  }
}

export const generateUploadUrl = mutation({
  args: {
    workshopId: v.id("workshops"),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    await assertWorkshopOrganizer(ctx, args.workshopId);
    return await ctx.storage.generateUploadUrl();
  },
});

export const addFileResource = mutation({
  args: {
    workshopId: v.id("workshops"),
    title: v.string(),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
    fileId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.optional(v.string()),
  },
  returns: v.id("workshopResources"),
  handler: async (ctx, args) => {
    await assertWorkshopOrganizer(ctx, args.workshopId);
    await assertFileResourceLimit(ctx, args.workshopId);

    const order =
      args.order !== undefined
        ? args.order
        : await getNextResourceOrder(ctx, args.workshopId);

    return await ctx.db.insert("workshopResources", {
      workshopId: args.workshopId,
      title: args.title,
      description: args.description,
      order,
      content: {
        type: "file",
        fileId: args.fileId,
        fileName: args.fileName,
        fileSize: args.fileSize,
        mimeType: args.mimeType,
      },
    });
  },
});

export const addLinkResource = mutation({
  args: {
    workshopId: v.id("workshops"),
    title: v.string(),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
    url: v.string(),
  },
  returns: v.id("workshopResources"),
  handler: async (ctx, args) => {
    await assertWorkshopOrganizer(ctx, args.workshopId);

    const order =
      args.order !== undefined
        ? args.order
        : await getNextResourceOrder(ctx, args.workshopId);

    return await ctx.db.insert("workshopResources", {
      workshopId: args.workshopId,
      title: args.title,
      description: args.description,
      order,
      content: {
        type: "link",
        url: args.url,
      },
    });
  },
});

export const addRichTextResource = mutation({
  args: {
    workshopId: v.id("workshops"),
    title: v.string(),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
    body: v.string(),
  },
  returns: v.id("workshopResources"),
  handler: async (ctx, args) => {
    await assertWorkshopOrganizer(ctx, args.workshopId);

    const order =
      args.order !== undefined
        ? args.order
        : await getNextResourceOrder(ctx, args.workshopId);

    return await ctx.db.insert("workshopResources", {
      workshopId: args.workshopId,
      title: args.title,
      description: args.description,
      order,
      content: {
        type: "richtext",
        body: args.body,
      },
    });
  },
});

export const updateResource = mutation({
  args: {
    resourceId: v.id("workshopResources"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
    content: v.optional(resourceContentValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const resource = await ctx.db.get(args.resourceId);
    if (!resource) {
      throw new Error("Resource not found");
    }

    await assertWorkshopOrganizer(ctx, resource.workshopId);

    if (args.content?.type === "file" && resource.content.type !== "file") {
      await assertFileResourceLimit(ctx, resource.workshopId);
    }

    const patch: {
      title?: string;
      description?: string;
      order?: number;
      content?: Doc<"workshopResources">["content"];
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
    if (args.content !== undefined) {
      patch.content = args.content;
    }

    await ctx.db.patch(args.resourceId, patch);

    return null;
  },
});

export const deleteResource = mutation({
  args: {
    resourceId: v.id("workshopResources"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const resource = await ctx.db.get(args.resourceId);
    if (!resource) {
      throw new Error("Resource not found");
    }

    await assertWorkshopOrganizer(ctx, resource.workshopId);

    if (resource.content.type === "file") {
      await ctx.storage.delete(resource.content.fileId);
    }

    await ctx.db.delete(resource._id);

    return null;
  },
});

export const listResources = query({
  args: {
    workshopId: v.id("workshops"),
  },
  returns: v.array(resourceValidator),
  handler: async (ctx, args) => {
    await assertCanReadResources(ctx, args.workshopId);

    const resources = await ctx.db
      .query("workshopResources")
      .withIndex("by_workshopId", (q) => q.eq("workshopId", args.workshopId))
      .collect();

    resources.sort((a, b) => a.order - b.order);

    return resources;
  },
});

export const reorderResources = mutation({
  args: {
    workshopId: v.id("workshops"),
    items: v.array(
      v.object({
        resourceId: v.id("workshopResources"),
        order: v.number(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertWorkshopOrganizer(ctx, args.workshopId);

    const resources = await ctx.db
      .query("workshopResources")
      .withIndex("by_workshopId", (q) => q.eq("workshopId", args.workshopId))
      .collect();

    const resourceIds = new Set(resources.map((resource) => resource._id));

    for (const item of args.items) {
      if (!resourceIds.has(item.resourceId)) {
        throw new Error("Resource does not belong to this workshop");
      }
    }

    for (const item of args.items) {
      await ctx.db.patch(item.resourceId, {
        order: item.order,
      });
    }

    return null;
  },
});
