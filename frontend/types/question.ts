// --- SkillLevel ---
export interface SkillLevel {
  id: "beginner" | "intermediate" | "advanced";
  title: string;
  description: string;
  estimatedTime: number;
}

// --- SKILL ---
export interface Skill {
  id: string;
  title: string;
  icon: string;
  desc: string;
  category: string;
  levels: SkillLevel[];
  createdAt: string;
  updatedAt: string;
}

export type CreateSkillPayload = Omit<Skill, "id" | "createdAt" | "updatedAt">;
export type UpdateSkillPayload = Partial<Omit<Skill, "id" | "createdAt">>;

// --- QUESTION ---
export interface BaseQuestion {
  id: string;
  skillId: string;
  type: "choice" | "coding";
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  createdAt: string;
  updatedAt: string;
}

export interface ChoiceQuestion extends BaseQuestion {
  type: "choice";
  options: string[];
  correctAnswer: string;
  codeSnippet?: string;
}

export interface CodingQuestion extends BaseQuestion {
  type: "coding";
  initialCode: string;
  testCases?: string[];
}

export type Question = ChoiceQuestion | CodingQuestion;

export type CreateQuestionPayload = Omit<Question, "id" | "createdAt" | "updatedAt">;
export type UpdateQuestionPayload = Partial<Omit<Question, "id" | "createdAt" | "skillId">>;

// --- MISC ---
export const DIFFICULTY_OPTIONS = [
  { value: "beginner" as const, label: "Beginner", color: "beginnertext", bg: "beginnerbg" },
  { value: "intermediate" as const, label: "Intermediate", color: "intermediatetext", bg: "intermediatebg" },
  { value: "advanced" as const, label: "Advanced", color: "advancedtext", bg: "advancedbg" },
] as const;

export const CATEGORY_OPTIONS = [
  { value: "analyst", label: "Analyst" },
  { value: "programming", label: "Programming" },
  { value: "systems", label: "Systems and Tools" },
] as const;
