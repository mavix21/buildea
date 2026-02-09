import type { Doc, Id } from "@buildea/convex/_generated/dataModel";

// ============================================================================
// Base types from Convex schema
// ============================================================================
export type Difficulty = "easy" | "intermediate" | "hard" | "insane";

// ScoringMode flows from DB schema
type Quiz = Doc<"quizzes">;
export type ScoringMode = Quiz["scoringMode"];

export interface QuizOption {
  id: string;
  text: string;
  image?: Id<"_storage">;
}

export interface SingleChoiceConfig {
  type: "single_choice";
  options: QuizOption[];
  correctAnswerId: string;
}

export interface MultipleChoiceConfig {
  type: "multiple_choice";
  options: QuizOption[];
  correctAnswerIds: string[];
}

export interface TrueOrFalseConfig {
  type: "true_or_false";
  correctAnswer: boolean;
}

export type QuestionTypeConfig =
  | SingleChoiceConfig
  | MultipleChoiceConfig
  | TrueOrFalseConfig;

export interface RichContent {
  type: "code_snippet";
  language: string;
  code: string;
}

export interface QuizQuestion {
  _id: Id<"quizQuestions">;
  quizId: Id<"quizzes">;
  prompt: string;
  richContent?: RichContent;
  difficulty: Difficulty;
  explanation: string;
  order: number;
  points: number;
  typeConfig: QuestionTypeConfig;
}

// ============================================================================
// Quiz configuration
// ============================================================================
export interface QuizConfig {
  title: string;
  description?: string;
  scoringMode: ScoringMode;
  timeLimitSeconds?: number;
  shuffleQuestions: boolean;
  /** Minimum percentage to pass (0-100). Defaults to 0 (always pass). */
  passingScore?: number;
}

// ============================================================================
// Runtime state types
// ============================================================================
export type SelectedAnswer = string; // option ID or "true"/"false" for T/F

export interface QuizState {
  status: "idle" | "answering" | "submitted" | "completed" | "gameover";
  currentIndex: number;
  totalQuestions: number;
  currentQuestion: QuizQuestion | null;
  selectedAnswers: SelectedAnswer[];
  isCorrect: boolean | null;
  score: number;
  maxScore: number;
  scoringMode: ScoringMode;
  currentLives: number | null; // only for scoringMode.type === "lives"
  timeRemaining: number | null;
  questionTimes: number[];
  justLostLife: boolean;
  correctAnswers: number;
}

export interface QuizActions {
  select: (answerId: string) => void;
  deselect: (answerId: string) => void;
  submit: () => void;
  continue: () => void;
  restart: () => void;
}

export interface QuizMeta {
  config: QuizConfig;
  questions: QuizQuestion[];
}

export interface QuizContextValue {
  state: QuizState;
  actions: QuizActions;
  meta: QuizMeta;
}

// ============================================================================
// Result type for onComplete callback
// ============================================================================
export interface AnswerResult {
  questionId: string;
  selectedAnswers: SelectedAnswer[];
  isCorrect: boolean;
  timeSpentMs: number;
}

export interface QuizResult {
  score: number;
  maxScore: number;
  passed: boolean;
  totalTimeSpentMs: number;
  answers: AnswerResult[];
}
