// Quiz Feature
// Brilliant-inspired quiz component using composition patterns + XState
//
// Architecture follows Vercel composition patterns:
// - architecture-compound-components: Quiz.Frame, Quiz.Options, etc.
// - state-context-interface: state/actions/meta interface
// - state-decouple-implementation: XStateQuizProvider isolates XState
// - patterns-explicit-variants: SingleChoiceQuiz, MixedQuiz, etc.
// - react19-no-forwardref: use() instead of useContext()

// Types
export * from "./quiz.types";

// Context and Providers
export { QuizContext, QuizProvider, XStateQuizProvider } from "./quiz.context";

// Machine (for custom implementations)
export { quizMachine } from "./quiz.machine";
export type { QuizMachineInput } from "./quiz.machine";

// Compound Component + Hook
export { Quiz, useQuiz } from "./quiz";

// Explicit Variants (pre-composed for common use cases)
export {
  MixedQuiz,
  MinimalQuiz,
  MultipleChoiceQuiz,
  SingleChoiceQuiz,
  TrueOrFalseQuiz,
} from "./quiz.variants";
