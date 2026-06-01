import type {
  Question,
  ChoiceQuestion,
  CodingQuestion,
  Skill,
  CreateQuestionPayload,
} from "@/types/question";
import type { SkillLevel } from "@/types/skill";

export type ApiProblem = {
  _id: string;
  skillId: string;
  level: string;
  question: string;
  questionType: "multiple_choice" | "true_false" | "coding";
  choices?: { label: string; text: string }[];
  correctAnswer?: string;
  explanation?: string;
  languageId?: string | { _id: string; monaco_identifier?: string; judge0_id?: number };
  templateCode?: string;
  testCases?: { input: string; expectedOutput: string; isHidden: boolean }[];
};

export function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
}

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

export function mapProblemToForm(problem: ApiProblem): Question {
  const base = {
    id: problem._id,
    skillId: String(problem.skillId),
    title: problem.question,
    description: problem.explanation || "",
    difficulty: problem.level as ChoiceQuestion["difficulty"],
    createdAt: "",
    updatedAt: "",
  };

  if (problem.questionType === "coding") {
    const langId =
      problem.languageId && typeof problem.languageId === "object"
        ? problem.languageId._id
        : (problem.languageId as string) || "";

    return {
      ...base,
      type: "coding",
      templateCode: problem.templateCode || "",
      languageId: langId,
      testCases: problem.testCases?.length
        ? problem.testCases
        : [{ input: "", expectedOutput: "", isHidden: false }],
    } as CodingQuestion;
  }

  const choices = problem.choices || [];
  const options = choices.map((c) => c.text);
  const correctChoice = choices.find((c) => c.label === problem.correctAnswer);

  return {
    ...base,
    type: "choice",
    options: options.length >= 2 ? options : ["", "", "", ""],
    correctAnswer: correctChoice?.text || "",
    codeSnippet: undefined,
  } as ChoiceQuestion;
}

export function mapFormToProblemPayload(
  data: CreateQuestionPayload,
  level: string
): Record<string, unknown> {
  const base = {
    level,
    question: data.title,
    explanation: data.description,
  };

  if (data.type === "coding") {
    return {
      ...base,
      questionType: "coding",
      templateCode: data.templateCode,
      languageId: data.languageId,
      testCases: data.testCases,
    };
  }

  const filledOptions = data.options.filter((o) => o.trim());
  const choices = filledOptions.map((text, i) => ({
    label: OPTION_LABELS[i] || String(i + 1),
    text: text.trim(),
  }));

  const correctIdx = filledOptions.indexOf(data.correctAnswer);
  const correctAnswer =
    correctIdx >= 0
      ? OPTION_LABELS[correctIdx] || String(correctIdx + 1)
      : data.correctAnswer;

  return {
    ...base,
    questionType: "multiple_choice",
    choices,
    correctAnswer,
  };
}

export function mapDbSkillToFormSkill(skill: {
  _id: string;
  title: string;
  icon: string;
  description: string;
  category: string;
  levels: Array<{
    level: string;
    description: string;
    estimatedTime: number;
    questionCount?: number;
    actualQuestionCount?: number;
    mode?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}): Skill {
  return {
    id: skill._id,
    title: skill.title,
    icon: skill.icon,
    desc: skill.description,
    category: skill.category,
    levels: skill.levels.map((l) => ({
      id: l.level as Skill["levels"][0]["id"],
      title: l.level.charAt(0).toUpperCase() + l.level.slice(1),
      description: l.description,
      estimatedTime: l.estimatedTime,
    })),
    createdAt: skill.createdAt || "",
    updatedAt: skill.updatedAt || "",
  };
}

export function getLevelQuestionCount(
  level: SkillLevel & { actualQuestionCount?: number }
): number {
  if (typeof level.actualQuestionCount === "number") {
    return level.actualQuestionCount;
  }
  return level.questionCount ?? 0;
}

export async function fetchAdminProblem(
  problemId: string,
  token: string
): Promise<ApiProblem | null> {
  const res = await fetch(`${getApiUrl()}/admin/problems/${problemId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!data.success) return null;
  return data.problem;
}

export async function fetchAdminProblems(
  skillId: string,
  level: string,
  token: string
): Promise<ApiProblem[]> {
  const res = await fetch(
    `${getApiUrl()}/admin/skills/${skillId}/problems?level=${encodeURIComponent(level)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  if (!data.success) return [];
  return data.problems;
}

export async function createAdminProblem(
  skillId: string,
  payload: Record<string, unknown>,
  token: string
) {
  const res = await fetch(`${getApiUrl()}/admin/skills/${skillId}/problems`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateAdminProblem(
  problemId: string,
  payload: Record<string, unknown>,
  token: string
) {
  const res = await fetch(`${getApiUrl()}/admin/problems/${problemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteAdminProblem(problemId: string, token: string) {
  const res = await fetch(`${getApiUrl()}/admin/problems/${problemId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
