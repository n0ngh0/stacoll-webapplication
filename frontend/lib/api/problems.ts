import type {
  Question,
  ChoiceQuestion,
  CodingQuestion,
  CreateQuestionPayload,
} from "@/types/question";
import type { Skill, SkillLevel } from "@/types/skill";
import { apiFetch, getApiUrl } from "@/lib/api/client";

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

export { getApiUrl };

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

export function getLevelQuestionCount(
  level: SkillLevel & { actualQuestionCount?: number }
): number {
  if (typeof level.actualQuestionCount === "number") {
    return level.actualQuestionCount;
  }
  return level.questionCount ?? 0;
}

export async function fetchAdminProblem(
  problemId: string
): Promise<ApiProblem | null> {
  const res = await apiFetch(`/admin/problems/${problemId}`);
  const data = await res.json();
  if (!data.success) return null;
  return data.problem;
}

export async function fetchAdminProblems(
  skillId: string,
  level: string
): Promise<ApiProblem[]> {
  const res = await apiFetch(
    `/admin/skills/${skillId}/problems?level=${encodeURIComponent(level)}`
  );
  const data = await res.json();
  if (!data.success) return [];
  return data.problems;
}

export async function createAdminProblem(
  skillId: string,
  payload: Record<string, unknown>
) {
  const res = await apiFetch(`/admin/skills/${skillId}/problems`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateAdminProblem(
  problemId: string,
  payload: Record<string, unknown>
) {
  const res = await apiFetch(`/admin/problems/${problemId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteAdminProblem(problemId: string) {
  const res = await apiFetch(`/admin/problems/${problemId}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function fetchSkillById(skillId: string): Promise<Skill | null> {
  const res = await apiFetch(`/skills/${skillId}`);
  const data = await res.json();
  if (!data.success || !data.skill) return null;
  return data.skill as Skill;
}
