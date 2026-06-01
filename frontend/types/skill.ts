// Type definitions สำหรับ Skill system

export interface SkillLevel {
  level: "beginner" | "intermediate" | "advanced";
  description: string;
  questionCount: number;
  estimatedTime: number;
  /** จำนวนข้อสอบจริงจาก MongoDB (จาก getSkillById) */
  actualQuestionCount?: number;
  mode?: string;
}

export interface Skill {
  _id: string;
  title: string;
  description: string;
  category: "analyst" | "programming" | "systems";
  icon: string;
  levels: SkillLevel[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProblemChoice {
  label: string;
  text: string;
}

export interface Problem {
  _id: string;
  skillId: string;
  level: string;
  question: string;
  questionType: "multiple_choice" | "true_false" | "coding";
  choices?: ProblemChoice[];
  correctAnswer?: string;
  explanation?: string;
  languageId?: string | { _id: string; monaco_identifier?: string; judge0_id?: number };
  templateCode?: string;
  testCases?: { input: string; expectedOutput: string; isHidden: boolean }[];
}
