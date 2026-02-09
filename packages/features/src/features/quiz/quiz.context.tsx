"use client";

import type { ReactNode } from "react";
import { createContext, useEffect, useMemo } from "react";
import { useMachine } from "@xstate/react";

import type {
  QuizActions,
  QuizConfig,
  QuizContextValue,
  QuizMeta,
  QuizQuestion,
  QuizResult,
  QuizState,
} from "./quiz.types";
import { quizMachine } from "./quiz.machine";

// ============================================================================
// Context
// ============================================================================
export const QuizContext = createContext<QuizContextValue | null>(null);

// ============================================================================
// XState Provider (high-level, manages state internally)
// ============================================================================
interface XStateQuizProviderProps {
  config: QuizConfig;
  questions: QuizQuestion[];
  children: ReactNode;
  onComplete?: (result: QuizResult) => void;
}

/**
 * High-level provider that uses XState for state management.
 * Use this when you want the quiz to manage its own state.
 *
 * For custom state implementations, use Quiz.Provider directly
 * with your own state/actions/meta.
 */
export function XStateQuizProvider({
  config,
  questions,
  children,
  onComplete,
}: XStateQuizProviderProps) {
  const [snapshot, send] = useMachine(quizMachine, {
    input: { config, questions, onComplete },
  });

  // Beforeunload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (snapshot.value === "answering" || snapshot.value === "submitted") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [snapshot.value]);

  // Timer tick
  useEffect(() => {
    if (
      snapshot.context.timeRemaining === null ||
      snapshot.value !== "answering"
    ) {
      return;
    }

    const interval = setInterval(() => {
      if (snapshot.context.timeRemaining! <= 0) {
        send({ type: "TIMEOUT" });
      } else {
        send({ type: "TICK" });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [snapshot.value, snapshot.context.timeRemaining, send]);

  // Actions
  const actions: QuizActions = useMemo(
    () => ({
      select: (answerId: string) => send({ type: "SELECT_ANSWER", answerId }),
      deselect: (answerId: string) =>
        send({ type: "DESELECT_ANSWER", answerId }),
      submit: () => send({ type: "SUBMIT" }),
      continue: () => send({ type: "CONTINUE" }),
      restart: () => send({ type: "RESTART" }),
    }),
    [send],
  );

  // Derived state
  const currentQuestion =
    snapshot.context.questions[snapshot.context.currentIndex] ?? null;
  const maxScore = questions.reduce((sum, q) => sum + q.points, 0);

  const state: QuizState = useMemo(
    () => ({
      status: snapshot.value,
      currentIndex: snapshot.context.currentIndex,
      totalQuestions: snapshot.context.questions.length,
      currentQuestion,
      selectedAnswers: snapshot.context.selectedAnswers,
      isCorrect: snapshot.context.isCurrentCorrect,
      score: snapshot.context.score,
      maxScore,
      scoringMode: snapshot.context.scoringMode,
      currentLives: snapshot.context.currentLives,
      timeRemaining: snapshot.context.timeRemaining,
      questionTimes: snapshot.context.questionTimes,
      justLostLife: snapshot.context.justLostLife,
      correctAnswers: snapshot.context.correctAnswers,
    }),
    [snapshot, currentQuestion, maxScore],
  );

  const meta: QuizMeta = useMemo(
    () => ({
      config,
      questions,
    }),
    [config, questions],
  );

  const contextValue: QuizContextValue = useMemo(
    () => ({ state, actions, meta }),
    [state, actions, meta],
  );

  return (
    <QuizContext.Provider value={contextValue}>{children}</QuizContext.Provider>
  );
}

// Keep QuizProvider as alias for backwards compatibility
export const QuizProvider = XStateQuizProvider;
