import { components } from "../_generated/api";
import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { authComponent } from "../auth";
import { throwForbidden } from "../errors";

type ReadCtx = QueryCtx | MutationCtx;

export async function getCurrentAppUser(ctx: ReadCtx): Promise<Doc<"users">> {
  const authUser = await authComponent.getAuthUser(ctx);

  const appUser = await ctx.db
    .query("users")
    .withIndex("by_authId", (q) => q.eq("authId", authUser._id))
    .unique();

  if (!appUser) {
    throw new Error("App user not found");
  }

  return appUser;
}

export async function assertCommunityMember(
  ctx: ReadCtx,
  communityId: Id<"communities">,
): Promise<Doc<"users">> {
  const appUser = await getCurrentAppUser(ctx);

  const community = await ctx.db.get(communityId);
  if (!community) {
    throw new Error("Community not found");
  }

  const member = await ctx.runQuery(components.betterAuth.adapter.findOne, {
    model: "member",
    where: [
      { field: "organizationId", operator: "eq", value: community.orgId },
      { field: "userId", operator: "eq", value: appUser.authId },
    ],
  });

  if (!member) {
    throwForbidden("You must be a member of this community");
  }

  return appUser;
}

export async function assertWorkshopOrganizer(
  ctx: ReadCtx,
  workshopId: Id<"workshops">,
): Promise<{ workshop: Doc<"workshops">; appUser: Doc<"users"> }> {
  const appUser = await getCurrentAppUser(ctx);

  const workshop = await ctx.db.get(workshopId);
  if (!workshop) {
    throw new Error("Workshop not found");
  }

  const isOrganizer =
    workshop.creatorId === appUser._id ||
    workshop.coHosts.some((coHostId) => coHostId === appUser._id);

  if (!isOrganizer) {
    throwForbidden("Only organizers can manage this workshop");
  }

  return { workshop, appUser };
}
