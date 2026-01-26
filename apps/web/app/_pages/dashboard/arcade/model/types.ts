export type ArcadeDifficulty = "beginner" | "intermediate" | "advanced";

export interface Arcade {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  difficulty: ArcadeDifficulty;
  isNew?: boolean;
}
