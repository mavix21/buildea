import { v } from "convex/values";

import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { userAnswer } from "./tables/utils";

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
          if (submission) {
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
        const levelSubmissions = submissions.filter(
          (s) => s.quizId === level.quizId && s.completedAt !== undefined,
        );
        if (levelSubmissions.length > 0) {
          // Pick the submission with the highest number of correct answers
          let bestPercentage = 0;
          for (const submission of levelSubmissions) {
            const correctCount = submission.answers.filter(
              (a) => a.isCorrect,
            ).length;
            const totalCount = submission.answers.length;
            const percentage =
              totalCount > 0
                ? Math.round((correctCount / totalCount) * 100)
                : 0;
            if (percentage > bestPercentage) {
              bestPercentage = percentage;
            }
          }
          userScores.set(level.quizId, bestPercentage);
          completedLevelNumbers.add(level.level);
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

          isLocked = !prevSubmission || !prevSubmission.completedAt;
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

      isCompleted = !!submission && !!submission.completedAt;
    }

    return {
      _id: level._id,
      arcadeId: level.arcadeId,
      arcadeTitle: arcade.title,
      level: level.level,
      quizId: level.quizId,
      labelDifficulty: level.labelDifficulty,
      isLocked,
      isCompleted,
    };
  },
});

// Option validator for questions
const optionValidator = v.object({
  id: v.string(),
  text: v.string(),
  image: v.optional(v.id("_storage")),
});

// Question type config validator
const typeConfigValidator = v.union(
  v.object({
    type: v.literal("single_choice"),
    options: v.array(optionValidator),
    correctAnswerId: v.string(),
  }),
  v.object({
    type: v.literal("multiple_choice"),
    options: v.array(optionValidator),
    correctAnswerIds: v.array(v.string()),
  }),
  v.object({
    type: v.literal("true_or_false"),
    correctAnswer: v.boolean(),
  }),
);

// Rich content validator
const richContentValidator = v.object({
  type: v.literal("code_snippet"),
  language: v.string(),
  code: v.string(),
});

/**
 * Get quiz config and questions for playing a quiz.
 */
export const getQuizWithQuestions = query({
  args: {
    quizId: v.id("quizzes"),
  },
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) return null;

    // Get XP config for points calculation
    const xpConfig = await ctx.db.query("xpConfig").first();
    const difficultyXp = xpConfig?.difficultyXp ?? {
      easy: 10,
      intermediate: 20,
      hard: 30,
      insane: 50,
    };

    // Fetch questions
    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quizId", (q) => q.eq("quizId", args.quizId))
      .collect();

    // Sort by order
    questions.sort((a, b) => a.order - b.order);

    // Map questions with points
    const questionsWithPoints = questions.map((q) => ({
      ...q,
      points: difficultyXp[q.difficulty],
    }));

    return {
      config: {
        title: quiz.title,
        description: quiz.description,
        scoringMode: quiz.scoringMode,
        timeLimitSeconds: quiz.timeLimitSeconds,
        shuffleQuestions: quiz.shuffleQuestions,
      },
      questions: questionsWithPoints,
    };
  },
});

/**
 * Submit a completed quiz attempt.
 * Handles XP deduplication: only awards XP for questions not previously answered correctly.
 */
export const submitQuiz = mutation({
  args: {
    quizId: v.id("quizzes"),
    arcadeId: v.id("arcades"),
    score: v.number(),
    totalTimeSpent: v.number(),
    answers: v.array(
      v.object({
        questionId: v.id("quizQuestions"),
        timeSpentSeconds: v.number(),
        isCorrect: v.boolean(),
        userAnswer: userAnswer,
      }),
    ),
  },
  returns: v.object({
    success: v.boolean(),
    xpAwarded: v.number(),
  }),
  handler: async (ctx, args) => {
    // 1. Auth check
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to submit quiz");
    }

    // 2. Get quiz for scoringMode validation
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) {
      throw new Error("Quiz not found");
    }

    // 3. Get XP config
    const xpConfig = await ctx.db.query("xpConfig").first();
    const difficultyXp = xpConfig?.difficultyXp ?? {
      easy: 10,
      intermediate: 20,
      hard: 30,
      insane: 50,
    };

    // 4. Check eligibility based on scoring mode
    const maxScore = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quizId", (q) => q.eq("quizId", args.quizId))
      .collect()
      .then((qs) => qs.reduce((sum, q) => sum + difficultyXp[q.difficulty], 0));

    let isEligible = true;
    if (quiz.scoringMode.type === "passing_score") {
      const passingThreshold = (quiz.scoringMode.passingScore / 100) * maxScore;
      isEligible = args.score >= passingThreshold;
    }
    // lives mode: if we got here, user completed (not game over)
    // practice mode: always eligible

    if (!isEligible) {
      return { success: false, xpAwarded: 0 };
    }

    // 5. XP Deduplication: get previously awarded question IDs
    const previousSubmissions = await ctx.db
      .query("quizSubmissions")
      .withIndex("by_quiz_user", (q) =>
        q.eq("quizId", args.quizId).eq("userId", userId),
      )
      .collect();

    const alreadyAwardedQuestionIds = new Set<Id<"quizQuestions">>();
    for (const submission of previousSubmissions) {
      for (const answer of submission.answers) {
        if (answer.xpAwarded > 0) {
          alreadyAwardedQuestionIds.add(answer.questionId);
        }
      }
    }

    // 6. Calculate XP for each answer
    const questionDifficulties = new Map<
      Id<"quizQuestions">,
      "easy" | "intermediate" | "hard" | "insane"
    >();
    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quizId", (q) => q.eq("quizId", args.quizId))
      .collect();
    for (const q of questions) {
      questionDifficulties.set(q._id, q.difficulty);
    }

    let totalXpAwarded = 0;
    const answersWithXp = args.answers.map((answer) => {
      const difficulty = questionDifficulties.get(answer.questionId);
      const baseXp = difficulty ? difficultyXp[difficulty] : 0;

      // Award XP only if correct AND not already awarded
      const xpAwarded =
        answer.isCorrect && !alreadyAwardedQuestionIds.has(answer.questionId)
          ? baseXp
          : 0;

      totalXpAwarded += xpAwarded;

      return {
        ...answer,
        xpAwarded,
      };
    });

    // 7. Insert submission
    await ctx.db.insert("quizSubmissions", {
      userId,
      quizId: args.quizId,
      source: { type: "arcade" as const, arcadeId: args.arcadeId },
      completedAt: Date.now(),
      score: args.score,
      totalTimeSpent: args.totalTimeSpent,
      answers: answersWithXp,
      totalXpAwarded,
    });

    // 8. Update user XP
    if (totalXpAwarded > 0) {
      const user = await ctx.db.get(userId);
      if (user) {
        await ctx.db.patch(userId, {
          totalXp: user.totalXp + totalXpAwarded,
        });
      }
    }

    return { success: true, xpAwarded: totalXpAwarded };
  },
});
