import { Doc } from "./_generated/dataModel";
import { MutationCtx, query } from "./_generated/server";
import { authComponent } from "./auth";

/**
 * Compute level from total XP using quadratic formula
 * level = floor(sqrt(totalXp / base))
 */
function computeLevel(totalXp: number, base: number): number {
  if (totalXp <= 0 || base <= 0) return 0;
  return Math.floor(Math.sqrt(totalXp / base));
}

/**
 * Calculate XP required to reach a specific level
 * xpForLevel = base * level²
 */
function xpForLevel(level: number, base: number): number {
  return base * level * level;
}

export async function awardXp(
  ctx: MutationCtx,
  args: {
    userId: Doc<"users">["_id"];
    amount: number;
    source: Doc<"xpTransactions">["source"];
    multiplier?: number;
    createdAt?: number;
  },
): Promise<void> {
  if (args.amount <= 0) {
    return;
  }

  const user = await ctx.db.get(args.userId);
  if (!user) {
    throw new Error("User not found");
  }

  const multiplier = args.multiplier ?? 1;
  const finalXp = args.amount * multiplier;
  const createdAt = args.createdAt ?? Date.now();

  await ctx.db.patch(user._id, {
    totalXp: user.totalXp + finalXp,
  });

  await ctx.db.insert("xpTransactions", {
    userId: user._id,
    xpAmount: args.amount,
    multiplier,
    finalXp,
    source: args.source,
    createdAt,
  });
}

/**
 * Get level info for current user (level, title, XP progress)
 */
export const getUserLevelInfo = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);

    // Get app user
    const appUser = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", authUser._id))
      .unique();

    const totalXp = appUser?.totalXp ?? 0;

    // Get XP config (default if not set)
    const xpConfig = await ctx.db.query("xpConfig").first();
    const base = xpConfig?.levelFormula.base ?? 100;

    // Compute level
    const level = computeLevel(totalXp, base);

    // Calculate XP within current level
    const xpAtCurrentLevel = xpForLevel(level, base);
    const xpAtNextLevel = xpForLevel(level + 1, base);
    const currentXp = totalXp - xpAtCurrentLevel;
    const xpNeededForNextLevel = xpAtNextLevel - xpAtCurrentLevel;

    // Get title for current level
    const levelTitles = await ctx.db
      .query("levelTitles")
      .withIndex("by_minLevel")
      .order("desc")
      .collect();

    let title: string | null = null;
    for (const lt of levelTitles) {
      if (level >= lt.minLevel) {
        if (lt.maxLevel === undefined || level <= lt.maxLevel) {
          title = lt.title;
          break;
        }
      }
    }

    return {
      level,
      title,
      currentXp,
      xpForNextLevel: xpNeededForNextLevel,
      totalXp,
    };
  },
});
