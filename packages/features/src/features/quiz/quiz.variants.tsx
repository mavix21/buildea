/**
 * Explicit Quiz Variant Components
 *
 * Per composition pattern `patterns-explicit-variants`:
 * Create explicit variant components instead of one component with many boolean props.
 * Each variant is self-documenting and composes the pieces it needs.
 */

"use client";

import type { QuizConfig, QuizQuestion, QuizResult } from "./quiz.types";
import { Quiz } from "./quiz";
import { QuizProvider } from "./quiz.context";

// ============================================================================
// Single Choice Quiz Variant
// ============================================================================
interface SingleChoiceQuizProps {
  config: QuizConfig;
  questions: QuizQuestion[];
  onComplete?: (result: QuizResult) => void;
  className?: string;
}

/**
 * Pre-composed single-choice quiz variant.
 * Use when all questions have exactly one correct answer.
 */
export function SingleChoiceQuiz({
  config,
  questions,
  onComplete,
  className,
}: SingleChoiceQuizProps) {
  return (
    <QuizProvider config={config} questions={questions} onComplete={onComplete}>
      <Quiz.KeyboardShortcuts />
      <Quiz.Frame className={className}>
        <Quiz.Header>
          <Quiz.Progress />
          <Quiz.Lives />
          <Quiz.Timer />
        </Quiz.Header>

        <Quiz.Start />

        <Quiz.Question />
        <Quiz.Points />

        <Quiz.Options>
          <Quiz.OptionsRenderer />
        </Quiz.Options>

        <Quiz.Submit />
        <Quiz.Feedback />
        <Quiz.Explanation />
        <Quiz.Continue />

        <Quiz.Results />
      </Quiz.Frame>
    </QuizProvider>
  );
}

// ============================================================================
// Multiple Choice Quiz Variant
// ============================================================================
interface MultipleChoiceQuizProps {
  config: QuizConfig;
  questions: QuizQuestion[];
  onComplete?: (result: QuizResult) => void;
  className?: string;
}

/**
 * Pre-composed multiple-choice quiz variant.
 * Use when questions can have multiple correct answers.
 */
export function MultipleChoiceQuiz({
  config,
  questions,
  onComplete,
  className,
}: MultipleChoiceQuizProps) {
  return (
    <QuizProvider config={config} questions={questions} onComplete={onComplete}>
      <Quiz.KeyboardShortcuts />
      <Quiz.Frame className={className}>
        <Quiz.Header>
          <Quiz.Progress />
          <Quiz.Lives />
          <Quiz.Timer />
        </Quiz.Header>

        <Quiz.Start />

        <Quiz.Question />
        <Quiz.Points />

        <Quiz.Options>
          <Quiz.OptionsRenderer />
        </Quiz.Options>

        <Quiz.Submit />
        <Quiz.Feedback />
        <Quiz.Explanation />
        <Quiz.Continue />

        <Quiz.Results />
      </Quiz.Frame>
    </QuizProvider>
  );
}

// ============================================================================
// True/False Quiz Variant
// ============================================================================
interface TrueOrFalseQuizProps {
  config: QuizConfig;
  questions: QuizQuestion[];
  onComplete?: (result: QuizResult) => void;
  className?: string;
}

/**
 * Pre-composed true/false quiz variant.
 * Use when all questions are true/false format.
 */
export function TrueOrFalseQuiz({
  config,
  questions,
  onComplete,
  className,
}: TrueOrFalseQuizProps) {
  return (
    <QuizProvider config={config} questions={questions} onComplete={onComplete}>
      <Quiz.KeyboardShortcuts />
      <Quiz.Frame className={className}>
        <Quiz.Header>
          <Quiz.Progress />
          <Quiz.Lives />
          <Quiz.Timer />
        </Quiz.Header>

        <Quiz.Start />

        <Quiz.Question />
        <Quiz.Points />

        <Quiz.Options>
          <div className="flex gap-4">
            <Quiz.TrueFalseOption value={true} label="True" />
            <Quiz.TrueFalseOption value={false} label="False" />
          </div>
        </Quiz.Options>

        <Quiz.Submit />
        <Quiz.Feedback />
        <Quiz.Explanation />
        <Quiz.Continue />

        <Quiz.Results />
      </Quiz.Frame>
    </QuizProvider>
  );
}

// ============================================================================
// Mixed Quiz Variant (default - handles all question types)
// ============================================================================
interface MixedQuizProps {
  config: QuizConfig;
  questions: QuizQuestion[];
  onComplete?: (result: QuizResult) => void;
  className?: string;
}

/**
 * Pre-composed mixed quiz variant.
 * Handles all question types (single, multiple, true/false) in one quiz.
 * Uses OptionsRenderer for dynamic rendering.
 */
export function MixedQuiz({
  config,
  questions,
  onComplete,
  className,
}: MixedQuizProps) {
  return (
    <QuizProvider config={config} questions={questions} onComplete={onComplete}>
      <Quiz.KeyboardShortcuts />
      <Quiz.Frame className={className}>
        <Quiz.Header>
          <Quiz.Progress />
          <Quiz.Lives />
          <Quiz.Timer />
        </Quiz.Header>

        <Quiz.Start />

        <Quiz.Question />
        <Quiz.Points />

        <Quiz.Options>
          <Quiz.OptionsRenderer />
        </Quiz.Options>

        <Quiz.Submit />
        <Quiz.Feedback />
        <Quiz.Explanation />
        <Quiz.Continue />

        <Quiz.Results />
      </Quiz.Frame>
    </QuizProvider>
  );
}

// ============================================================================
// Minimal Quiz Variant (no lives, no timer)
// ============================================================================
interface MinimalQuizProps {
  config: QuizConfig;
  questions: QuizQuestion[];
  onComplete?: (result: QuizResult) => void;
  className?: string;
}

/**
 * Minimal quiz variant without lives, timer, or points display.
 * Use for simple practice quizzes.
 */
export function MinimalQuiz({
  config,
  questions,
  onComplete,
  className,
}: MinimalQuizProps) {
  return (
    <QuizProvider config={config} questions={questions} onComplete={onComplete}>
      <Quiz.KeyboardShortcuts />
      <Quiz.Frame className={className}>
        <Quiz.Header>
          <Quiz.Progress />
        </Quiz.Header>

        <Quiz.Start />

        <Quiz.Question />

        <Quiz.Options>
          <Quiz.OptionsRenderer />
        </Quiz.Options>

        <Quiz.Submit />
        <Quiz.Feedback />
        <Quiz.Continue />

        <Quiz.Results />
      </Quiz.Frame>
    </QuizProvider>
  );
}
