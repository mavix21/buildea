import { assign, fromCallback, setup } from "xstate";

import type {
  QuizConfig,
  QuizQuestion,
  QuizResult,
  ScoringMode,
  SelectedAnswer,
} from "./quiz.types";

// ============================================================================
// Answer History - for submission tracking
// ============================================================================
export interface AnswerHistoryEntry {
  questionId: string;
  selectedAnswers: SelectedAnswer[];
  isCorrect: boolean;
  timeSpentMs: number;
}

// ============================================================================
// Context
// ============================================================================
export interface QuizMachineContext {
  config: QuizConfig;
  questions: QuizQuestion[];
  currentIndex: number;
  selectedAnswers: SelectedAnswer[];
  score: number;
  scoringMode: ScoringMode;
  currentLives: number | null; // only for scoringMode.type === "lives"
  timeRemaining: number | null;
  questionTimes: number[]; // ms per question
  questionStartTime: number | null;
  isCurrentCorrect: boolean | null;
  justLostLife: boolean;
  correctAnswers: number;
  answerHistory: AnswerHistoryEntry[]; // All answers for submission
  onComplete?: (result: QuizResult) => void; // Callback for completion
}

// ============================================================================
// Events
// ============================================================================
export type QuizMachineEvent =
  | { type: "SELECT_ANSWER"; answerId: string }
  | { type: "DESELECT_ANSWER"; answerId: string }
  | { type: "SUBMIT" }
  | { type: "CONTINUE" }
  | { type: "TICK" }
  | { type: "TIMEOUT" }
  | { type: "RESTART" };

// ============================================================================
// Input (for createMachine)
// ============================================================================
export interface QuizMachineInput {
  config: QuizConfig;
  questions: QuizQuestion[];
  onComplete?: (result: QuizResult) => void;
}

// ============================================================================
// Helpers
// ============================================================================
function getCurrentQuestion(ctx: QuizMachineContext): QuizQuestion | undefined {
  return ctx.questions[ctx.currentIndex];
}

function checkAnswer(ctx: QuizMachineContext): boolean {
  const question = getCurrentQuestion(ctx);
  if (!question) return false;

  const selected = ctx.selectedAnswers;

  switch (question.typeConfig.type) {
    case "single_choice":
      return (
        selected.length === 1 &&
        selected[0] === question.typeConfig.correctAnswerId
      );
    case "multiple_choice": {
      const correct = new Set(question.typeConfig.correctAnswerIds);
      const selectedSet = new Set(selected);
      return (
        correct.size === selectedSet.size &&
        [...correct].every((id) => selectedSet.has(id))
      );
    }
    case "true_or_false": {
      const selectedBool = selected[0] === "true";
      return selectedBool === question.typeConfig.correctAnswer;
    }
    default:
      return false;
  }
}

function getInitialLives(scoringMode: ScoringMode): number | null {
  return scoringMode.type === "lives" ? scoringMode.lives : null;
}

// ============================================================================
// Machine
// ============================================================================
export const quizMachine = setup({
  types: {
    context: {} as QuizMachineContext,
    events: {} as QuizMachineEvent,
    input: {} as QuizMachineInput,
  },
  actors: {
    timerActor: fromCallback<
      QuizMachineEvent,
      { timeRemaining: number | null }
    >(({ sendBack, input }) => {
      if (input.timeRemaining === null) return;
      const interval = setInterval(() => {
        sendBack({ type: "TICK" });
      }, 1000);
      return () => clearInterval(interval);
    }),
  },
  guards: {
    hasSelection: ({ context }) => context.selectedAnswers.length > 0,
    isCorrect: ({ context }) => checkAnswer(context),
    hasLives: ({ context }) =>
      context.currentLives === null || context.currentLives > 0,
    hasMoreQuestions: ({ context }) =>
      context.currentIndex < context.questions.length - 1,
    hasTime: ({ context }) =>
      context.timeRemaining === null || context.timeRemaining > 0,
    isLivesMode: ({ context }) => context.scoringMode.type === "lives",
  },
  actions: {
    selectAnswer: assign({
      selectedAnswers: ({ context, event }) => {
        if (event.type !== "SELECT_ANSWER") return context.selectedAnswers;
        const question = getCurrentQuestion(context);
        if (!question) return context.selectedAnswers;

        // Single choice & true/false: replace selection
        if (
          question.typeConfig.type === "single_choice" ||
          question.typeConfig.type === "true_or_false"
        ) {
          return [event.answerId];
        }

        // Multiple choice: toggle
        if (context.selectedAnswers.includes(event.answerId)) {
          return context.selectedAnswers;
        }
        return [...context.selectedAnswers, event.answerId];
      },
    }),
    deselectAnswer: assign({
      selectedAnswers: ({ context, event }) => {
        if (event.type !== "DESELECT_ANSWER") return context.selectedAnswers;
        return context.selectedAnswers.filter((id) => id !== event.answerId);
      },
    }),
    evaluateAnswer: assign({
      isCurrentCorrect: ({ context }) => checkAnswer(context),
      score: ({ context }) => {
        const question = getCurrentQuestion(context);
        if (!question) return context.score;
        return checkAnswer(context)
          ? context.score + question.points
          : context.score;
      },
      currentLives: ({ context }) => {
        if (context.scoringMode.type !== "lives") return null;
        if (context.currentLives === null) return null;
        return checkAnswer(context)
          ? context.currentLives
          : context.currentLives - 1;
      },
      justLostLife: ({ context }) => {
        if (context.scoringMode.type !== "lives") return false;
        return !checkAnswer(context);
      },
      correctAnswers: ({ context }) =>
        checkAnswer(context)
          ? context.correctAnswers + 1
          : context.correctAnswers,
      questionTimes: ({ context }) => {
        const elapsed = context.questionStartTime
          ? Date.now() - context.questionStartTime
          : 0;
        return [...context.questionTimes, elapsed];
      },
      answerHistory: ({ context }) => {
        const question = getCurrentQuestion(context);
        if (!question) return context.answerHistory;
        const elapsed = context.questionStartTime
          ? Date.now() - context.questionStartTime
          : 0;
        return [
          ...context.answerHistory,
          {
            questionId: question._id,
            selectedAnswers: [...context.selectedAnswers],
            isCorrect: checkAnswer(context),
            timeSpentMs: elapsed,
          },
        ];
      },
    }),
    advanceQuestion: assign({
      currentIndex: ({ context }) => context.currentIndex + 1,
      selectedAnswers: () => [],
      isCurrentCorrect: () => null,
      questionStartTime: () => Date.now(),
      justLostLife: () => false,
    }),
    tick: assign({
      timeRemaining: ({ context }) => {
        if (context.timeRemaining === null) return null;
        return Math.max(0, context.timeRemaining - 1);
      },
    }),
    resetQuiz: assign({
      currentIndex: () => 0,
      selectedAnswers: () => [],
      score: () => 0,
      currentLives: ({ context }) => getInitialLives(context.scoringMode),
      timeRemaining: ({ context }) => context.config.timeLimitSeconds ?? null,
      questionTimes: () => [],
      questionStartTime: () => Date.now(),
      isCurrentCorrect: () => null,
      justLostLife: () => false,
      correctAnswers: () => 0,
      answerHistory: () => [],
    }),
  },
}).createMachine({
  id: "quiz",
  initial: "answering", // Auto-start the quiz
  context: ({ input }) => ({
    config: input.config,
    questions: input.config.shuffleQuestions
      ? [...input.questions].sort(() => Math.random() - 0.5)
      : input.questions,
    currentIndex: 0,
    selectedAnswers: [],
    score: 0,
    scoringMode: input.config.scoringMode,
    currentLives: getInitialLives(input.config.scoringMode),
    timeRemaining: input.config.timeLimitSeconds ?? null,
    questionTimes: [],
    questionStartTime: Date.now(), // Start timer immediately
    isCurrentCorrect: null,
    justLostLife: false,
    correctAnswers: 0,
    answerHistory: [],
    onComplete: input.onComplete,
  }),
  states: {
    idle: {
      on: {
        CONTINUE: {
          target: "answering",
          actions: assign({ questionStartTime: () => Date.now() }),
        },
      },
    },
    answering: {
      invoke: {
        src: "timerActor",
        input: ({ context }) => ({ timeRemaining: context.timeRemaining }),
      },
      on: {
        SELECT_ANSWER: {
          actions: "selectAnswer",
        },
        DESELECT_ANSWER: {
          actions: "deselectAnswer",
        },
        SUBMIT: {
          target: "submitted",
          guard: "hasSelection",
          actions: "evaluateAnswer",
        },
        TICK: [
          {
            target: "completed",
            guard: ({ context }) =>
              context.timeRemaining !== null && context.timeRemaining <= 0,
          },
          {
            actions: "tick",
          },
        ],
        TIMEOUT: {
          target: "completed",
        },
      },
    },
    submitted: {
      on: {
        CONTINUE: [
          {
            target: "gameover",
            guard: ({ context }) =>
              context.scoringMode.type === "lives" &&
              context.currentLives !== null &&
              context.currentLives <= 0,
          },
          {
            target: "completed",
            guard: ({ context }) =>
              context.currentIndex >= context.questions.length - 1,
          },
          {
            target: "answering",
            guard: "hasMoreQuestions",
            actions: "advanceQuestion",
          },
          {
            target: "completed",
          },
        ],
      },
    },
    gameover: {
      on: {
        RESTART: {
          target: "answering",
          actions: "resetQuiz",
        },
      },
    },
    completed: {
      entry: ({ context }) => {
        if (!context.onComplete) return;

        const maxScore = context.questions.reduce(
          (sum, q) => sum + q.points,
          0,
        );
        const totalTimeSpentMs = context.questionTimes.reduce(
          (sum, t) => sum + t,
          0,
        );

        // Compute passed based on scoring mode
        let passed = true;
        if (context.scoringMode.type === "passing_score") {
          const threshold = (context.scoringMode.passingScore / 100) * maxScore;
          passed = context.score >= threshold;
        }
        // lives mode: if we reached completed (not gameover), we passed
        // practice mode: always passed

        context.onComplete({
          score: context.score,
          maxScore,
          passed,
          totalTimeSpentMs,
          answers: context.answerHistory,
        });
      },
      on: {
        RESTART: {
          target: "answering",
          actions: "resetQuiz",
        },
      },
    },
  },
});

export type QuizMachine = typeof quizMachine;
