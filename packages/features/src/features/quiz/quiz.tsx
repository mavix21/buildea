"use client";

import type { ReactNode } from "react";
import { use, useEffect, useState } from "react";
import { Check, Heart, Sparkles, X } from "lucide-react";

import { Button } from "@buildea/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@buildea/ui/components/drawer";
import { cn } from "@buildea/ui/lib/utils";

import type {
  QuizContextValue,
  QuizOption as QuizOptionType,
} from "./quiz.types";
import { QuizContext } from "./quiz.context";

// ============================================================================
// Hook
// ============================================================================
export function useQuiz() {
  const context = use(QuizContext);
  if (!context) {
    throw new Error("Quiz components must be used within a QuizProvider");
  }
  return context;
}

// ============================================================================
// Generic Provider (dependency-injectable)
// ============================================================================
interface QuizProviderProps {
  value: QuizContextValue;
  children: ReactNode;
}

/**
 * Low-level provider that accepts pre-built context value.
 * For dependency injection - allows different state implementations.
 */
function QuizProvider({ value, children }: QuizProviderProps) {
  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

// ============================================================================
// Frame
// ============================================================================
interface QuizFrameProps {
  children: ReactNode;
  className?: string;
}

function QuizFrame({ children, className }: QuizFrameProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-2xl flex-col gap-6 p-4",
        className,
      )}
      role="region"
      aria-label="Quiz"
    >
      {children}
    </div>
  );
}

// ============================================================================
// Header (contains progress, lives, timer)
// ============================================================================
interface QuizHeaderProps {
  children: ReactNode;
  className?: string;
}

function QuizHeader({ children, className }: QuizHeaderProps) {
  return (
    <div
      className={cn("flex items-center justify-between gap-4", className)}
      role="banner"
    >
      {children}
    </div>
  );
}

// ============================================================================
// Progress Bar (Brilliant-style segmented)
// ============================================================================
function QuizProgress({ className }: { className?: string }) {
  const { state } = useQuiz();
  const { currentIndex, totalQuestions, status } = state;

  if (status === "gameover" || status === "completed") return null;

  return (
    <div
      className={cn("flex flex-1 gap-1", className)}
      role="progressbar"
      aria-valuenow={currentIndex + 1}
      aria-valuemin={1}
      aria-valuemax={totalQuestions}
      aria-label={`Question ${currentIndex + 1} of ${totalQuestions}`}
    >
      {Array.from({ length: totalQuestions }).map((_, i) => {
        let segmentClass = "bg-muted";
        if (i < currentIndex) {
          segmentClass = "bg-primary";
        } else if (i === currentIndex && status !== "idle") {
          segmentClass = "bg-primary/60";
        }
        return (
          <div
            key={i}
            className={cn(
              "h-2 flex-1 rounded-full transition-colors",
              segmentClass,
            )}
          />
        );
      })}
    </div>
  );
}

// ============================================================================
// Lives (Hearts)
// ============================================================================
function QuizLives({ className }: { className?: string }) {
  const { state } = useQuiz();
  const { scoringMode, currentLives, justLostLife, status } = state;
  const [shake, setShake] = useState(false);

  // Trigger shake animation when life is lost
  useEffect(() => {
    if (justLostLife) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 600);
      return () => clearTimeout(timer);
    }
  }, [justLostLife, currentLives]);

  // Only show for lives mode
  if (
    scoringMode.type !== "lives" ||
    currentLives === null ||
    status === "gameover" ||
    status === "completed"
  ) {
    return null;
  }

  const maxLives = scoringMode.lives;

  return (
    <div
      className={cn(
        "flex items-center gap-1 transition-transform",
        shake && "animate-[shake_0.5s_ease-in-out]",
        className,
      )}
      aria-label={`${currentLives} lives remaining out of ${maxLives}`}
    >
      {Array.from({ length: maxLives }).map((_, i) => (
        <Heart
          key={i}
          className={cn(
            "size-5 transition-all duration-300",
            i < currentLives
              ? "fill-red-500 text-red-500"
              : "fill-muted text-muted-foreground scale-90",
            // Animate the heart that was just lost
            justLostLife &&
              i === currentLives &&
              "animate-[pulse_0.5s_ease-in-out]",
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

// ============================================================================
// Timer
// ============================================================================
function QuizTimer({ className }: { className?: string }) {
  const { state } = useQuiz();
  const { timeRemaining } = state;

  if (timeRemaining === null) {
    return null;
  }

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeString = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div
      className={cn(
        "font-mono text-sm font-medium tabular-nums",
        timeRemaining <= 10 && "text-destructive animate-pulse",
        className,
      )}
      role="timer"
      aria-label={`${minutes} minutes and ${seconds} seconds remaining`}
    >
      {timeString}
    </div>
  );
}

// ============================================================================
// Question Prompt
// ============================================================================
function QuizQuestion({ className }: { className?: string }) {
  const { state } = useQuiz();
  const { currentQuestion, currentIndex, totalQuestions, status } = state;

  if (!currentQuestion || status === "gameover" || status === "completed")
    return null;

  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-muted-foreground text-sm">
        Question {currentIndex + 1} of {totalQuestions}
      </p>
      <h2 className="text-xl font-semibold" id="quiz-question">
        {currentQuestion.prompt}
      </h2>
      {currentQuestion.richContent?.type === "code_snippet" && (
        <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm">
          <code>{currentQuestion.richContent.code}</code>
        </pre>
      )}
    </div>
  );
}

// ============================================================================
// Options Container (auto-detects grid/list)
// ============================================================================
interface QuizOptionsProps {
  children: ReactNode;
  className?: string;
}

function QuizOptions({ children, className }: QuizOptionsProps) {
  const { state } = useQuiz();
  const { currentQuestion, status } = state;

  if (!currentQuestion || status === "gameover") return null;

  // Check if any option has images
  const hasImages =
    currentQuestion.typeConfig.type !== "true_or_false" &&
    currentQuestion.typeConfig.options.some((opt) => opt.image);

  // Show hint for multiple choice
  const isMultiple = currentQuestion.typeConfig.type === "multiple_choice";

  return (
    <div className="space-y-3" role="group" aria-labelledby="quiz-question">
      {isMultiple && (
        <p className="text-muted-foreground text-sm italic">
          Select all that apply
        </p>
      )}
      <div
        className={cn(
          hasImages ? "grid grid-cols-2 gap-3" : "flex flex-col gap-2",
          className,
        )}
        role={isMultiple ? "group" : "radiogroup"}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// Single Option
// ============================================================================
interface QuizOptionProps {
  option: QuizOptionType;
  className?: string;
}

function QuizOption({ option, className }: QuizOptionProps) {
  const { state, actions } = useQuiz();
  const { currentQuestion, selectedAnswers, status } = state;

  if (!currentQuestion) return null;

  const isSelected = selectedAnswers.includes(option.id);
  const isSubmitted = status === "submitted";
  const isMultiple = currentQuestion.typeConfig.type === "multiple_choice";

  // Determine if this option is correct (for highlighting after submit)
  let isCorrectOption = false;
  if (currentQuestion.typeConfig.type === "single_choice") {
    isCorrectOption = option.id === currentQuestion.typeConfig.correctAnswerId;
  } else if (currentQuestion.typeConfig.type === "multiple_choice") {
    isCorrectOption = currentQuestion.typeConfig.correctAnswerIds.includes(
      option.id,
    );
  }

  const handleClick = () => {
    if (isSubmitted) return;
    if (isMultiple) {
      if (isSelected) {
        actions.deselect(option.id);
      } else {
        actions.select(option.id);
      }
    } else {
      actions.select(option.id);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSubmitted}
      role={isMultiple ? "checkbox" : "radio"}
      aria-checked={isSelected}
      aria-disabled={isSubmitted}
      className={cn(
        "relative flex items-center gap-3 rounded-lg border p-4 text-left transition-all",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
        !isSubmitted && "hover:border-primary/50 cursor-pointer",
        isSubmitted && "cursor-default",
        // Selection state (before submit)
        !isSubmitted &&
          isSelected &&
          "border-primary bg-(--quiz-option-selected)",
        // After submit: Selected + correct option = GREEN
        isSubmitted &&
          isSelected &&
          isCorrectOption &&
          "border-(--quiz-correct) bg-(--quiz-correct-muted)",
        // After submit: Selected + wrong option = RED
        isSubmitted &&
          isSelected &&
          !isCorrectOption &&
          "border-(--quiz-incorrect) bg-(--quiz-incorrect-muted)",
        // After submit: Not selected + correct option = GRAY (missed)
        isSubmitted &&
          !isSelected &&
          isCorrectOption &&
          "border-muted-foreground/50 bg-muted/50",
        className,
      )}
    >
      {/* Radio/Checkbox indicator */}
      <div
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          isMultiple && "rounded",
          isSelected ? "border-primary bg-primary" : "border-muted-foreground",
          // After submit: selected correct = green indicator
          isSubmitted &&
            isSelected &&
            isCorrectOption &&
            "border-(--quiz-correct) bg-(--quiz-correct)",
          // After submit: selected wrong = red indicator
          isSubmitted &&
            isSelected &&
            !isCorrectOption &&
            "border-(--quiz-incorrect) bg-(--quiz-incorrect)",
          // After submit: missed correct = gray indicator
          isSubmitted &&
            !isSelected &&
            isCorrectOption &&
            "border-muted-foreground bg-muted",
        )}
        aria-hidden="true"
      >
        {/* Show check for selected options */}
        {isSelected && <Check className="size-3 text-white" />}
        {/* Show grayed check for missed correct options */}
        {isSubmitted && !isSelected && isCorrectOption && (
          <Check className="text-muted-foreground size-3" />
        )}
      </div>
      <span className="flex-1">{option.text}</span>
      {isSubmitted && isSelected && (
        <span className="shrink-0" aria-hidden="true">
          {isCorrectOption ? (
            <Check className="size-5 text-(--quiz-correct)" />
          ) : (
            <X className="size-5 text-(--quiz-incorrect)" />
          )}
        </span>
      )}
    </button>
  );
}

// ============================================================================
// True/False Option
// ============================================================================
interface QuizTrueFalseOptionProps {
  value: boolean;
  label: string;
  className?: string;
}

function QuizTrueFalseOption({
  value,
  label,
  className,
}: QuizTrueFalseOptionProps) {
  const { state, actions } = useQuiz();
  const { currentQuestion, selectedAnswers, status, isCorrect } = state;

  if (currentQuestion?.typeConfig.type !== "true_or_false") {
    return null;
  }

  const answerId = String(value);
  const isSelected = selectedAnswers.includes(answerId);
  const isSubmitted = status === "submitted";
  const isCorrectOption = currentQuestion.typeConfig.correctAnswer === value;

  const handleClick = () => {
    if (isSubmitted) return;
    actions.select(answerId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSubmitted}
      role="radio"
      aria-checked={isSelected}
      aria-disabled={isSubmitted}
      className={cn(
        "flex-1 rounded-lg border p-4 font-medium transition-all",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
        !isSubmitted && "hover:border-primary/50 cursor-pointer",
        isSubmitted && "cursor-default",
        !isSubmitted &&
          isSelected &&
          "border-primary bg-(--quiz-option-selected)",
        isSubmitted &&
          isSelected &&
          isCorrect &&
          "border-(--quiz-correct) bg-(--quiz-correct-muted)",
        isSubmitted &&
          isSelected &&
          !isCorrect &&
          "border-(--quiz-incorrect) bg-(--quiz-incorrect-muted)",
        isSubmitted &&
          !isSelected &&
          isCorrectOption &&
          "border-(--quiz-correct) bg-(--quiz-correct-muted)/40",
        className,
      )}
    >
      {label}
    </button>
  );
}

// ============================================================================
// Submit Button
// ============================================================================
interface QuizSubmitProps {
  className?: string;
  children?: ReactNode;
}

function QuizSubmit({ className, children = "Submit" }: QuizSubmitProps) {
  const { state, actions } = useQuiz();
  const { selectedAnswers, status } = state;

  // Only show during answering phase
  if (status !== "answering") {
    return null;
  }

  const canSubmit = selectedAnswers.length > 0;

  return (
    <Button
      onClick={actions.submit}
      disabled={!canSubmit}
      className={cn("w-full", className)}
      size="lg"
    >
      {children}
    </Button>
  );
}

// ============================================================================
// Feedback
// ============================================================================
function QuizFeedback({ className }: { className?: string }) {
  const { state } = useQuiz();
  const {
    status,
    isCorrect,
    currentQuestion,
    justLostLife,
    currentLives,
    scoringMode,
  } = state;

  if (status !== "submitted" || currentQuestion === null) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg p-4",
        isCorrect ? "bg-(--quiz-correct-muted)" : "bg-(--quiz-incorrect-muted)",
        className,
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          {isCorrect ? (
            <>
              <span className="text-lg">🎉</span>
              <span>Correct!</span>
            </>
          ) : (
            <>
              <span className="text-lg">😔</span>
              <span>Not quite</span>
            </>
          )}
        </div>
        {isCorrect && (
          <div className="flex items-center gap-1 text-sm font-medium text-(--quiz-correct)">
            <Sparkles className="size-4" aria-hidden="true" />+
            {currentQuestion.points} XP
          </div>
        )}
      </div>
      {/* Life lost indicator (only for lives mode) */}
      {justLostLife &&
        scoringMode.type === "lives" &&
        currentLives !== null && (
          <div className="flex items-center gap-2 text-sm font-medium text-red-500">
            <Heart className="size-4 fill-red-500" aria-hidden="true" />
            <span>
              {currentLives > 0
                ? `You lost a life! ${currentLives} remaining`
                : "You lost your last life!"}
            </span>
          </div>
        )}
    </div>
  );
}

// ============================================================================
// Explanation Drawer
// ============================================================================
function QuizExplanation({ className }: { className?: string }) {
  const { state } = useQuiz();
  const { status, isCorrect, currentQuestion } = state;

  if (status !== "submitted" || currentQuestion === null) {
    return null;
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" className={cn("flex-1", className)} size="lg">
          {isCorrect ? "Show explanation" : "Why?"}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader className="text-center">
            <DrawerTitle className="text-xl">
              {isCorrect ? "Great job! 🎉" : "Here's why..."}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-6 pb-6">
            <p className="text-foreground text-center leading-relaxed">
              {currentQuestion.explanation}
            </p>
          </div>
          <DrawerFooter className="pb-6">
            <DrawerClose asChild>
              <Button variant="outline" size="lg">
                Got it
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// ============================================================================
// Continue Button
// ============================================================================
interface QuizContinueProps {
  className?: string;
  children?: ReactNode;
}

function QuizContinue({ className, children = "Continue" }: QuizContinueProps) {
  const { state, actions } = useQuiz();
  const { status } = state;

  if (status !== "submitted") {
    return null;
  }

  return (
    <Button
      onClick={actions.continue}
      className={cn("flex-1", className)}
      size="lg"
    >
      {children}
    </Button>
  );
}

// ============================================================================
// Actions Container (for side-by-side Explanation + Continue)
// ============================================================================
function QuizActionsContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { state } = useQuiz();
  const { status } = state;

  if (status !== "submitted") {
    return null;
  }

  return <div className={cn("flex gap-3", className)}>{children}</div>;
}

// ============================================================================
// Points Display
// ============================================================================
function QuizPoints({ className }: { className?: string }) {
  const { state } = useQuiz();
  const { currentQuestion, status } = state;

  if (!currentQuestion || status === "gameover" || status === "completed") {
    return null;
  }

  return (
    <div className={cn("text-muted-foreground text-sm", className)}>
      {currentQuestion.points} points
    </div>
  );
}

// ============================================================================
// Results Screen
// ============================================================================
interface QuizResultsProps {
  className?: string;
  onFinish?: (results: {
    score: number;
    maxScore: number;
    percentage: number;
    didPass: boolean;
  }) => void;
}

function QuizResults({ className, onFinish }: QuizResultsProps) {
  const { state, actions, meta } = useQuiz();
  const { status, score, maxScore, questionTimes, totalQuestions } = state;

  if (status !== "completed") {
    return null;
  }

  const percentage = Math.round((score / maxScore) * 100);
  const totalTime = questionTimes.reduce((sum, t) => sum + t, 0);
  const avgTime = Math.round(totalTime / totalQuestions / 1000);

  // Determine if user passed
  const passingScore = meta.config.passingScore ?? 0;
  const didPass = percentage >= passingScore;

  const handleFinish = () => {
    onFinish?.({ score, maxScore, percentage, didPass });
  };

  return (
    <div
      className={cn("space-y-6 text-center", className)}
      role="region"
      aria-label="Quiz Results"
    >
      <div>
        <h2 className="text-3xl font-bold">
          {didPass ? "Quiz Complete!" : "Keep Practicing!"}
        </h2>
        <p className="text-muted-foreground mt-2">Here's how you did</p>
      </div>

      <div className="bg-card rounded-xl border p-6">
        <div
          className={cn(
            "text-5xl font-bold",
            didPass ? "text-primary" : "text-muted-foreground",
          )}
        >
          {percentage}%
        </div>
        <p className="text-muted-foreground mt-1">
          {score} / {maxScore} points
        </p>
      </div>

      <div className="text-muted-foreground text-sm">
        Average time per question: {avgTime}s
      </div>

      {/* Action buttons in a row */}
      <div className="flex gap-3">
        {/* Try Again (required when failed) or Redo (optional when passed) */}
        <Button onClick={actions.restart} variant="outline" className="flex-1">
          {didPass ? "Redo Quiz" : "Try Again"}
        </Button>

        {/* Finish button - always shown */}
        <Button onClick={handleFinish} className="flex-1">
          Finish
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Start Screen
// ============================================================================
interface QuizStartProps {
  className?: string;
  children?: ReactNode;
}

function QuizStart({ className, children = "Start Quiz" }: QuizStartProps) {
  const { state, actions } = useQuiz();
  const { status } = state;

  if (status !== "idle") {
    return null;
  }

  return (
    <Button
      onClick={actions.continue}
      className={cn("w-full", className)}
      size="lg"
    >
      {children}
    </Button>
  );
}

// ============================================================================
// Keyboard Shortcuts
// ============================================================================
function QuizKeyboardShortcuts() {
  const { state, actions } = useQuiz();
  const { status, currentQuestion, selectedAnswers } = state;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Number keys 1-9 to select options
      if (
        status === "answering" &&
        currentQuestion &&
        e.key >= "1" &&
        e.key <= "9"
      ) {
        const index = parseInt(e.key) - 1;
        if (currentQuestion.typeConfig.type === "true_or_false") {
          if (index === 0) actions.select("true");
          if (index === 1) actions.select("false");
        } else if (
          currentQuestion.typeConfig.type === "single_choice" ||
          currentQuestion.typeConfig.type === "multiple_choice"
        ) {
          const option = currentQuestion.typeConfig.options[index];
          if (option) {
            if (currentQuestion.typeConfig.type === "multiple_choice") {
              if (selectedAnswers.includes(option.id)) {
                actions.deselect(option.id);
              } else {
                actions.select(option.id);
              }
            } else {
              actions.select(option.id);
            }
          }
        }
      }

      // Enter to submit or continue
      if (e.key === "Enter" && !e.shiftKey) {
        if (status === "answering" && selectedAnswers.length > 0) {
          e.preventDefault();
          actions.submit();
        } else if (status === "submitted") {
          e.preventDefault();
          actions.continue();
        } else if (status === "idle") {
          e.preventDefault();
          actions.continue();
        }
      }

      // Space to continue after submit
      if (e.key === " " && status === "submitted") {
        e.preventDefault();
        actions.continue();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, currentQuestion, selectedAnswers, actions]);

  return null;
}

// ============================================================================
// Options Renderer - helper for rendering options based on question type
// ============================================================================
function QuizOptionsRenderer() {
  const { state } = useQuiz();
  const { currentQuestion, status } = state;

  if (!currentQuestion || status === "idle" || status === "completed") {
    return null;
  }

  const { typeConfig } = currentQuestion;

  if (typeConfig.type === "true_or_false") {
    return (
      <>
        <QuizTrueFalseOption value={true} label="True" />
        <QuizTrueFalseOption value={false} label="False" />
      </>
    );
  }

  if (
    typeConfig.type === "single_choice" ||
    typeConfig.type === "multiple_choice"
  ) {
    return (
      <>
        {typeConfig.options.map((option) => (
          <QuizOption key={option.id} option={option} />
        ))}
      </>
    );
  }

  return null;
}

// ============================================================================
// Game Over Screen (when all lives are lost)
// ============================================================================
function QuizGameOver({ className }: { className?: string }) {
  const { state, actions } = useQuiz();
  const { status, correctAnswers, totalQuestions } = state;

  if (status !== "gameover") {
    return null;
  }

  return (
    <div
      className={cn("space-y-6 text-center", className)}
      role="region"
      aria-label="Game Over"
    >
      <div>
        <div className="mx-auto mb-4 flex justify-center">
          <div className="rounded-full bg-red-500/10 p-4">
            <Heart className="size-12 fill-red-500 text-red-500" />
          </div>
        </div>
        <h2 className="text-3xl font-bold">Game Over!</h2>
        <p className="text-muted-foreground mt-2">You ran out of lives</p>
      </div>

      <div className="bg-card rounded-xl border p-6">
        <div className="text-muted-foreground text-sm tracking-wide uppercase">
          Questions Answered
        </div>
        <div className="text-foreground mt-2 text-4xl font-bold">
          {correctAnswers}{" "}
          <span className="text-muted-foreground text-2xl">
            / {totalQuestions}
          </span>
        </div>
        <p className="text-muted-foreground mt-2 text-sm">correct answers</p>
      </div>

      <p className="text-muted-foreground text-sm">
        No points earned. Try again to complete the quiz!
      </p>

      <Button onClick={actions.restart} className="w-full" size="lg">
        Try Again
      </Button>
    </div>
  );
}

// ============================================================================
// Compound Export
// ============================================================================
export const Quiz = {
  Provider: QuizProvider,
  Frame: QuizFrame,
  Header: QuizHeader,
  Progress: QuizProgress,
  Lives: QuizLives,
  Timer: QuizTimer,
  Question: QuizQuestion,
  Options: QuizOptions,
  OptionsRenderer: QuizOptionsRenderer,
  Option: QuizOption,
  TrueFalseOption: QuizTrueFalseOption,
  Submit: QuizSubmit,
  Feedback: QuizFeedback,
  Explanation: QuizExplanation,
  Actions: QuizActionsContainer,
  Continue: QuizContinue,
  Points: QuizPoints,
  Results: QuizResults,
  GameOver: QuizGameOver,
  Start: QuizStart,
  KeyboardShortcuts: QuizKeyboardShortcuts,
};
