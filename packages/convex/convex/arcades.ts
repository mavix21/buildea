import { v } from "convex/values";

import { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";

// Helper to get userId from session (returns null if not authenticated)
async function getUserId(ctx: {
  db: any;
  auth: any;
}): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("by_authId", (q: any) => q.eq("authId", identity.subject))
    .unique();

  return user?._id ?? null;
}

/**
 * List all arcades with their levels and user completion status.
 * For arcade cards: shows title, description, image, and level hexagons with lock state.
 */
export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("arcades"),
      title: v.string(),
      slug: v.string(),
      description: v.string(),
      imageUrl: v.union(v.string(), v.null()),
      levels: v.array(
        v.object({
          _id: v.id("arcadeLevels"),
          level: v.number(),
          labelDifficulty: v.union(
            v.literal("easy"),
            v.literal("medium"),
            v.literal("hard"),
            v.literal("insane"),
          ),
          isLocked: v.boolean(),
          isCompleted: v.boolean(),
        }),
      ),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    const arcades = await ctx.db.query("arcades").collect();

    const result = [];

    for (const arcade of arcades) {
      const levels = await ctx.db
        .query("arcadeLevels")
        .withIndex("by_arcade_level", (q) => q.eq("arcadeId", arcade._id))
        .collect();

      levels.sort((a, b) => a.level - b.level);

      const completedLevelNumbers = new Set<number>();

      if (userId) {
        const submissions = await ctx.db
          .query("quizSubmissions")
          .withIndex("by_source_arcade", (q) =>
            q.eq("source.arcadeId", arcade._id).eq("userId", userId),
          )
          .collect();

        for (const level of levels) {
          const submission = submissions.find(
            (s) => s.quizId === level.quizId && s.completedAt !== undefined,
          );
          if (submission && submission.score >= level.passingScore) {
            completedLevelNumbers.add(level.level);
          }
        }
      }

      const levelsWithStatus = levels.map((level, index) => {
        const isCompleted = completedLevelNumbers.has(level.level);
        const isLocked =
          index > 0 && !completedLevelNumbers.has(levels[index - 1]!.level);

        return {
          _id: level._id,
          level: level.level,
          labelDifficulty: level.labelDifficulty,
          isLocked,
          isCompleted,
        };
      });

      const imageUrl = arcade.image
        ? await ctx.storage.getUrl(arcade.image)
        : null;

      result.push({
        _id: arcade._id,
        title: arcade.title,
        slug: arcade.slug,
        description: arcade.description,
        imageUrl,
        levels: levelsWithStatus,
      });
    }

    return result;
  },
});

/**
 * Get arcade detail by slug with full level info.
 */
export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("arcades"),
      title: v.string(),
      slug: v.string(),
      description: v.string(),
      imageUrl: v.union(v.string(), v.null()),
      levels: v.array(
        v.object({
          _id: v.id("arcadeLevels"),
          level: v.number(),
          quizId: v.id("quizzes"),
          labelDifficulty: v.union(
            v.literal("easy"),
            v.literal("medium"),
            v.literal("hard"),
            v.literal("insane"),
          ),
          passingScore: v.number(),
          isLocked: v.boolean(),
          isCompleted: v.boolean(),
          userScore: v.union(v.number(), v.null()),
          badgeConfig: v.optional(
            v.object({
              tokenId: v.string(),
              name: v.string(),
              imageUrl: v.string(),
            }),
          ),
        }),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);

    const arcade = await ctx.db
      .query("arcades")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!arcade) return null;

    const levels = await ctx.db
      .query("arcadeLevels")
      .withIndex("by_arcade_level", (q) => q.eq("arcadeId", arcade._id))
      .collect();

    levels.sort((a, b) => a.level - b.level);

    const userScores = new Map<Id<"quizzes">, number>();
    const completedLevelNumbers = new Set<number>();

    if (userId) {
      const submissions = await ctx.db
        .query("quizSubmissions")
        .withIndex("by_source_arcade", (q) =>
          q.eq("source.arcadeId", arcade._id).eq("userId", userId),
        )
        .collect();

      for (const level of levels) {
        const submission = submissions.find(
          (s) => s.quizId === level.quizId && s.completedAt !== undefined,
        );
        if (submission) {
          userScores.set(level.quizId, submission.score);
          if (submission.score >= level.passingScore) {
            completedLevelNumbers.add(level.level);
          }
        }
      }
    }

    const levelsWithStatus = levels.map((level, index) => {
      const isCompleted = completedLevelNumbers.has(level.level);
      const isLocked =
        index > 0 && !completedLevelNumbers.has(levels[index - 1]!.level);
      const userScore = userScores.get(level.quizId) ?? null;

      return {
        _id: level._id,
        level: level.level,
        quizId: level.quizId,
        labelDifficulty: level.labelDifficulty,
        passingScore: level.passingScore,
        isLocked,
        isCompleted,
        userScore,
        badgeConfig: level.badgeConfig,
      };
    });

    const imageUrl = arcade.image
      ? await ctx.storage.getUrl(arcade.image)
      : null;

    return {
      _id: arcade._id,
      title: arcade.title,
      slug: arcade.slug,
      description: arcade.description,
      imageUrl,
      levels: levelsWithStatus,
    };
  },
});

/**
 * Get specific level info for entering quiz.
 */
export const getLevel = query({
  args: {
    arcadeLevelId: v.id("arcadeLevels"),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("arcadeLevels"),
      arcadeId: v.id("arcades"),
      arcadeTitle: v.string(),
      level: v.number(),
      quizId: v.id("quizzes"),
      labelDifficulty: v.union(
        v.literal("easy"),
        v.literal("medium"),
        v.literal("hard"),
        v.literal("insane"),
      ),
      passingScore: v.number(),
      isLocked: v.boolean(),
      isCompleted: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);

    const level = await ctx.db.get(args.arcadeLevelId);
    if (!level) return null;

    const arcade = await ctx.db.get(level.arcadeId);
    if (!arcade) return null;

    let isLocked = false;
    let isCompleted = false;

    if (level.level > 1) {
      if (!userId) {
        isLocked = true;
      } else {
        const prevLevel = await ctx.db
          .query("arcadeLevels")
          .withIndex("by_arcade_level", (q) =>
            q.eq("arcadeId", level.arcadeId).eq("level", level.level - 1),
          )
          .unique();

        if (prevLevel) {
          const prevSubmission = await ctx.db
            .query("quizSubmissions")
            .withIndex("by_quiz_user", (q) =>
              q.eq("quizId", prevLevel.quizId).eq("userId", userId),
            )
            .first();

          isLocked =
            !prevSubmission ||
            !prevSubmission.completedAt ||
            prevSubmission.score < prevLevel.passingScore;
        }
      }
    }

    if (userId) {
      const submission = await ctx.db
        .query("quizSubmissions")
        .withIndex("by_quiz_user", (q) =>
          q.eq("quizId", level.quizId).eq("userId", userId),
        )
        .first();

      isCompleted =
        !!submission &&
        !!submission.completedAt &&
        submission.score >= level.passingScore;
    }

    return {
      _id: level._id,
      arcadeId: level.arcadeId,
      arcadeTitle: arcade.title,
      level: level.level,
      quizId: level.quizId,
      labelDifficulty: level.labelDifficulty,
      passingScore: level.passingScore,
      isLocked,
      isCompleted,
    };
  },
});
