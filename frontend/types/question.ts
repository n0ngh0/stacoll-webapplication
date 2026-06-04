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

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface CodingQuestion extends BaseQuestion {
  type: "coding";
  templateCode: string;
  languageId: string;
  testCases: TestCase[];
}

export type Question = ChoiceQuestion | CodingQuestion;

type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export type CreateQuestionPayload = DistributiveOmit<Question, "id" | "createdAt" | "updatedAt">;
export type UpdateQuestionPayload = Partial<DistributiveOmit<Question, "id" | "createdAt" | "skillId">>;

// --- MISC ---
export const LEVEL_OPTIONS = [
  { 
    value: "beginner" as const, 
    label: "Beginner", 
    color: "beginnertext", 
    bg: "beginnerbg",
    textClass: "text-beginnertext",
    bgClass: "bg-beginnerbg border-beginnertext/40"
  },
  { 
    value: "intermediate" as const, 
    label: "Intermediate", 
    color: "intermediatetext", 
    bg: "intermediatebg",
    textClass: "text-intermediatetext",
    bgClass: "bg-intermediatebg border-intermediatetext/40"
  },
  { 
    value: "advanced" as const, 
    label: "Advanced", 
    color: "advancedtext", 
    bg: "advancedbg",
    textClass: "text-advancedtext",
    bgClass: "bg-advancedbg border-advancedtext/90"
  },
] as const;

export const CATEGORY_OPTIONS = [
  { value: "analyst", label: "Analyst", theme: "#3b82f6" },
  { value: "programming", label: "Programming", theme: "#22c55e" },
  { value: "systems", label: "Systems and Tools", theme: "#f59e0b" },
] as const;

export const CATEGORY_THEMES: Record<string, string> = CATEGORY_OPTIONS.reduce(
  (themesMap, category) => {
    themesMap[category.value] = category.theme;
    return themesMap;
  }, {} as Record<string, string>
);

export const getLevelColorClass = (level: string) => {
  const found = LEVEL_OPTIONS.find(l => l.value === level.toLowerCase());
  return found ? found.textClass : LEVEL_OPTIONS[0].textClass;
};

export const getLevelBgColorClass = (level: string) => {
  const found = LEVEL_OPTIONS.find(l => l.value === level.toLowerCase());
  return found ? found.bgClass : LEVEL_OPTIONS[0].bgClass;
};
