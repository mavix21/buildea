"use client";

import type { Preloaded } from "convex/react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useMutation, usePreloadedQuery, useQuery } from "convex/react";
import { ArrowLeft, X as CloseIcon, Lock, Trophy } from "lucide-react";

import type { Id } from "@buildea/convex/_generated/dataModel";
import type { QuizResult } from "@buildea/features/features/quiz";
import { api } from "@buildea/convex/_generated/api";
import { Quiz, QuizProvider } from "@buildea/features/features/quiz";
import { Button } from "@buildea/ui/components/button";
import { cn } from "@buildea/ui/lib/utils";

type ArcadeDetailData = Preloaded<typeof api.arcades.getBySlug>;
type ArcadeData = NonNullable<
  ReturnType<typeof usePreloadedQuery<typeof api.arcades.getBySlug>>
>;
type LevelItem = ArcadeData["levels"][number];

interface ArcadeDetailProps {
  preloaded: ArcadeDetailData;
}

export function ArcadeDetail({ preloaded }: ArcadeDetailProps) {
  const arcade = usePreloadedQuery(preloaded);
  const [selectedQuizId, setSelectedQuizId] = useState<Id<"quizzes"> | null>(
    null,
  );

  // Fetch quiz data when a level is selected
  const quizData = useQuery(
    api.arcades.getQuizWithQuestions,
    selectedQuizId ? { quizId: selectedQuizId } : "skip",
  );

  // Mutation for submitting quiz
  const submitQuiz = useMutation(api.arcades.submitQuiz);

  if (!arcade) {
    notFound();
  }

  const handleQuizComplete = async (result: QuizResult) => {
    // Helper to convert selected answers to userAnswer format
    type UserAnswer =
      | { type: "single_choice"; selectedOptionId: string }
      | { type: "multiple_choice"; selectedOptionIds: string[] }
      | { type: "true_or_false"; value: boolean };

    const convertToUserAnswer = (selectedAnswers: string[]): UserAnswer => {
      // Determine answer type based on selected values
      if (
        selectedAnswers.length === 1 &&
        (selectedAnswers[0] === "true" || selectedAnswers[0] === "false")
      ) {
        return {
          type: "true_or_false",
          value: selectedAnswers[0] === "true",
        };
      }
      if (selectedAnswers.length === 1) {
        return {
          type: "single_choice",
          selectedOptionId: selectedAnswers[0]!,
        };
      }
      return {
        type: "multiple_choice",
        selectedOptionIds: selectedAnswers,
      };
    };
    if (result.passed && selectedQuizId) {
      try {
        const response = await submitQuiz({
          quizId: selectedQuizId,
          arcadeId: arcade._id,
          score: result.score,
          totalTimeSpent: Math.round(result.totalTimeSpentMs / 1000),
          answers: result.answers.map((a) => ({
            questionId: a.questionId as Id<"quizQuestions">,
            timeSpentSeconds: Math.round(a.timeSpentMs / 1000),
            isCorrect: a.isCorrect,
            userAnswer: convertToUserAnswer(a.selectedAnswers),
          })),
        });
        console.log(`Quiz submitted! XP awarded: ${response.xpAwarded}`);
      } catch (error) {
        console.error("Failed to submit quiz:", error);
      }
    }
    // Don't auto-close - let user see results
  };

  // Show quiz when selected and data is loaded
  if (selectedQuizId && quizData) {
    return (
      <div className="bg-background fixed inset-0 z-50">
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedQuizId(null)}
          >
            <CloseIcon className="size-5" />
          </Button>
        </div>
        <QuizProvider
          config={quizData.config}
          questions={quizData.questions}
          onComplete={handleQuizComplete}
        >
          <Quiz.KeyboardShortcuts />
          <Quiz.Frame className="pt-16">
            <Quiz.Header>
              <Quiz.Progress />
              <Quiz.Lives />
              <Quiz.Timer />
            </Quiz.Header>

            <Quiz.Start>Start Quiz</Quiz.Start>

            <Quiz.Question />
            <Quiz.Points />

            <Quiz.Options>
              <Quiz.OptionsRenderer />
            </Quiz.Options>

            <Quiz.Submit />
            <Quiz.Feedback />
            <Quiz.Actions>
              <Quiz.Explanation />
              <Quiz.Continue />
            </Quiz.Actions>

            <Quiz.Results onFinish={() => setSelectedQuizId(null)} />
            <Quiz.GameOver />
          </Quiz.Frame>
        </QuizProvider>
      </div>
    );
  }

  // Loading state when quiz is selected but data not yet loaded
  if (selectedQuizId && !quizData) {
    return (
      <div className="bg-background fixed inset-0 z-50 flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">
          Loading quiz...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/arcade"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Arcades
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {/* Arcade Image */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl md:w-80">
          {arcade.imageUrl ? (
            <Image
              src={arcade.imageUrl}
              alt={arcade.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="bg-muted flex h-full items-center justify-center">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <h1 className="font-pixel text-2xl font-bold md:text-3xl">
            {arcade.title}
          </h1>
          <p className="text-muted-foreground max-w-prose">
            {arcade.description}
          </p>

          {/* Progress summary */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Trophy className="text-primary size-4" />
              <span>
                {arcade.levels.filter((l) => l.isCompleted).length} /{" "}
                {arcade.levels.length} completed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Levels Grid */}
      <section className="space-y-4">
        <h2 className="font-pixel text-lg">Levels</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {arcade.levels.map((level) => (
            <LevelCard
              key={level._id}
              level={level}
              onStartQuiz={() => setSelectedQuizId(level.quizId)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

const difficultyTheme = {
  easy: {
    primary: "#10b981",
    secondary: "#059669",
    accent: "#34d399",
    label: "Easy",
    bgClass: "from-emerald-500/20 to-emerald-600/10",
    borderClass: "border-emerald-500/40",
  },
  medium: {
    primary: "#3b82f6",
    secondary: "#2563eb",
    accent: "#60a5fa",
    label: "Medium",
    bgClass: "from-blue-500/20 to-blue-600/10",
    borderClass: "border-blue-500/40",
  },
  hard: {
    primary: "#f59e0b",
    secondary: "#d97706",
    accent: "#fbbf24",
    label: "Hard",
    bgClass: "from-amber-500/20 to-amber-600/10",
    borderClass: "border-amber-500/40",
  },
  insane: {
    primary: "#a855f7",
    secondary: "#9333ea",
    accent: "#c084fc",
    label: "Insane",
    bgClass: "from-purple-500/20 to-purple-600/10",
    borderClass: "border-purple-500/40",
  },
} as const;

function LevelCard({
  level,
  onStartQuiz,
}: {
  level: LevelItem;
  onStartQuiz: () => void;
}) {
  const theme = difficultyTheme[level.labelDifficulty];
  const isActive = !level.isLocked;

  const content = (
    <div
      className={cn(
        "relative flex flex-col items-center justify-between gap-4 rounded-xl border p-6 transition-all",
        isActive
          ? `bg-linear-to-b ${theme.bgClass} ${theme.borderClass} hover:shadow-lg`
          : "border-zinc-800 bg-zinc-900/50",
        level.isLocked && "opacity-60",
      )}
    >
      {/* Level Banner */}
      <div className="relative flex flex-col items-center">
        {/* Decorative flourish */}
        <svg
          className={cn(
            "absolute -top-1 h-3 w-8",
            isActive ? "opacity-80" : "opacity-30",
          )}
          viewBox="0 0 32 12"
          fill="none"
        >
          <path
            d="M16 0 L12 4 L4 4 L0 8 M16 0 L20 4 L28 4 L32 8"
            stroke={isActive ? theme.accent : "#52525b"}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        {/* Hexagon */}
        <div className="relative z-10 flex size-16 items-center justify-center">
          {isActive && (
            <div
              className={cn(
                "absolute inset-0 opacity-50 blur-md",
                `bg-linear-to-b from-[${theme.accent}] to-[${theme.secondary}]`,
              )}
              style={{
                clipPath:
                  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                background: `linear-gradient(to bottom, ${theme.accent}, ${theme.secondary})`,
              }}
            />
          )}
          <svg className="absolute inset-0" viewBox="0 0 64 72" fill="none">
            <defs>
              <linearGradient
                id={`detail-grad-${level._id}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor={isActive ? theme.accent : "#3f3f46"}
                />
                <stop
                  offset="100%"
                  stopColor={isActive ? theme.secondary : "#27272a"}
                />
              </linearGradient>
            </defs>
            <path
              d="M32 4 L60 20 L60 52 L32 68 L4 52 L4 20 Z"
              fill={`url(#detail-grad-${level._id})`}
              stroke={isActive ? theme.primary : "#52525b"}
              strokeWidth="2"
            />
            <path
              d="M32 10 L54 24 L54 48 L32 62 L10 48 L10 24 Z"
              fill="none"
              stroke={isActive ? theme.accent : "#3f3f46"}
              strokeWidth="0.5"
              opacity="0.5"
            />
          </svg>
          <div className="relative z-10">
            {level.isLocked ? (
              <Lock className="size-6 text-zinc-500" />
            ) : level.isCompleted ? (
              <span className="text-xl font-bold text-white drop-shadow-lg">
                ✓
              </span>
            ) : (
              <span className="text-xl font-bold text-white drop-shadow-lg">
                {level.level}
              </span>
            )}
          </div>
        </div>

        {/* Banner */}
        <div className="relative -mt-2">
          <svg className="h-10 w-8" viewBox="0 0 32 40" fill="none">
            <defs>
              <linearGradient
                id={`detail-banner-${level._id}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor={isActive ? theme.primary : "#3f3f46"}
                />
                <stop
                  offset="100%"
                  stopColor={isActive ? theme.secondary : "#27272a"}
                />
              </linearGradient>
            </defs>
            <path
              d="M2 0 L30 0 L30 32 L16 40 L2 32 Z"
              fill={`url(#detail-banner-${level._id})`}
              stroke={isActive ? theme.accent : "#52525b"}
              strokeWidth="1"
            />
            <path
              d="M5 2 L5 30"
              stroke={isActive ? theme.accent : "#52525b"}
              strokeWidth="1"
              opacity="0.4"
            />
          </svg>
          <span
            className={cn(
              "absolute top-2 left-1/2 -translate-x-1/2 text-sm font-bold",
              isActive ? "text-white/90" : "text-zinc-500",
            )}
          >
            {level.level}
          </span>
        </div>
      </div>

      {/* Level Info */}
      <div className="text-center">
        <h3
          className="font-pixel text-sm font-semibold"
          style={{ color: isActive ? theme.primary : "#71717a" }}
        >
          {theme.label}
        </h3>
        {level.userScore !== null && (
          <p className="text-xs" style={{ color: theme.accent }}>
            Your score: {level.userScore}%
          </p>
        )}
      </div>

      {/* Action */}
      {isActive && (
        <Button
          size="sm"
          variant={level.isCompleted ? "outline" : "default"}
          className="w-full"
          onClick={onStartQuiz}
        >
          {level.isCompleted ? "Replay" : "Start Quiz"}
        </Button>
      )}
    </div>
  );

  return content;
}
