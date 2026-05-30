// Skill and Question Store — Mock Data
import type {
  Skill, CreateSkillPayload, UpdateSkillPayload,
  Question, CreateQuestionPayload, UpdateQuestionPayload
} from "@/types/question";

// SEED DATA
let SKILL_SEED_DATA: Skill[] = [
  {
    id: "sql",
    title: "SQL",
    icon: "SQL",
    desc: "ภาษามาตรฐานที่ใช้สำหรับสื่อสาร จัดการ และดึงข้อมูลจากระบบฐานข้อมูลเชิงสัมพันธ์",
    category: "analyst",
    levels: [
      { id: "beginner", title: "Beginner", description: "ทำพื้นฐานทั่วไปได้", estimatedTime: 30 },
      { id: "intermediate", title: "Intermediate", description: "สามารถประยุกต์ใช้งานได้", estimatedTime: 45 },
      { id: "advanced", title: "Advanced", description: "เข้าใจจุดแข็งของภาษานี้จริงๆ", estimatedTime: 60 }
    ],
    createdAt: new Date("2025-01-01").toISOString(),
    updatedAt: new Date("2025-01-01").toISOString(),
  },
  {
    id: "python",
    title: "Python",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/1280px-Python-logo-notext.svg.png",
    desc: "ภาษาโปรแกรมมิ่งยอดนิยมที่เขียนและอ่านง่ายมาก นำไปใช้งานได้ครอบจักรวาล",
    category: "programming",
    levels: [
      { id: "beginner", title: "Beginner", description: "เขียน script พื้นฐานได้", estimatedTime: 30 },
      { id: "intermediate", title: "Intermediate", description: "เข้าใจ OOP และ Data Structures", estimatedTime: 60 },
      { id: "advanced", title: "Advanced", description: "ออกแบบระบบและ Optimize โค้ดได้", estimatedTime: 90 }
    ],
    createdAt: new Date("2025-01-02").toISOString(),
    updatedAt: new Date("2025-01-02").toISOString(),
  },
  {
    id: "git-github",
    title: "Git/GitHub",
    icon: "https://cdn-icons-png.flaticon.com/512/25/25231.png",
    desc: "Git คือระบบที่คอยบันทึกประวัติการแก้ไขโค้ด (Version Control)",
    category: "systems",
    levels: [
      { id: "beginner", title: "Beginner", description: "commit, push, pull พื้นฐานได้", estimatedTime: 15 },
      { id: "intermediate", title: "Intermediate", description: "จัดการ branch และ merge conflict ได้", estimatedTime: 30 },
      { id: "advanced", title: "Advanced", description: "rebase, squash และ CI/CD พื้นฐาน", estimatedTime: 45 }
    ],
    createdAt: new Date("2025-01-03").toISOString(),
    updatedAt: new Date("2025-01-03").toISOString(),
  }
];

let QUESTION_SEED_DATA: Question[] = [
  {
    id: "q-seed-001",
    skillId: "python",
    type: "coding",
    title: "Two Sum",
    description: "Given an array of integers, return indices of the two numbers such that they add up to a specific target.",
    difficulty: "beginner",
    initialCode: 'def solve(nums, target):\n    # Write your code here\n    pass',
    testCases: ["assert solve([2,7,11,15], 9) == [0,1]", "assert solve([3,2,4], 6) == [1,2]"],
    createdAt: new Date("2025-01-15").toISOString(),
    updatedAt: new Date("2025-01-15").toISOString(),
  },
  {
    id: "q-seed-002",
    skillId: "python",
    type: "choice",
    title: "Python Memory Management",
    description: "Which of the following mechanisms does Python primarily use for automatic memory management and reclaiming unused objects?",
    difficulty: "intermediate",
    options: [
      "Reference Counting & Garbage Collection",
      "Manual Memory Deallocation (free())",
      "Mark-and-Sweep Only without reference counts",
      "Python does not manage memory automatically",
    ],
    correctAnswer: "Reference Counting & Garbage Collection",
    createdAt: new Date("2025-02-10").toISOString(),
    updatedAt: new Date("2025-02-10").toISOString(),
  },
  {
    id: "q-seed-003",
    skillId: "sql",
    type: "choice",
    title: "SQL JOIN Types",
    description: "Which JOIN type returns all rows from both tables, matching where possible and filling NULLs where no match exists?",
    difficulty: "intermediate",
    options: [
      "INNER JOIN",
      "LEFT JOIN",
      "FULL OUTER JOIN",
      "CROSS JOIN",
    ],
    correctAnswer: "FULL OUTER JOIN",
    createdAt: new Date("2025-04-01").toISOString(),
    updatedAt: new Date("2025-04-01").toISOString(),
  }
];

// Helper
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// SKILL CRUD
export function getSkills(): Skill[] {
  return SKILL_SEED_DATA;
}

export function getSkillById(id: string): Skill | null {
  const skills = getSkills();
  return skills.find((s) => s.id === id) ?? null;
}

export function createSkill(payload: CreateSkillPayload): Skill {
  const skills = getSkills();
  const now = new Date().toISOString();
  const newSkill: Skill = {
    ...payload,
    id: generateId("skill"),
    createdAt: now,
    updatedAt: now,
  };
  skills.unshift(newSkill);
  return newSkill;
}

export function updateSkill(id: string, payload: UpdateSkillPayload): Skill | null {
  const skills = getSkills();
  const index = skills.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const updated: Skill = {
    ...skills[index],
    ...payload,
    id,
    updatedAt: new Date().toISOString(),
  };
  if (index !== -1)
    SKILL_SEED_DATA[index] = updated;

  return updated;
}

export function deleteSkill(id: string): boolean {
  const skills = getSkills();
  const index = skills.findIndex((s) => s.id === id);
  if (index === -1) return false;

  skills.splice(index, 1);
  QUESTION_SEED_DATA = QUESTION_SEED_DATA.filter(q => q.skillId !== id);

  return true;
}

// Derived Info
export function getQuestionCountBySkill(skillId: string): number {
  const questions = getQuestions();
  return questions.filter(q => q.skillId === skillId).length;
}

export function getQuestionsByLevel(skillId: string, level: string): Question[] {
  const questions = getQuestions();
  return questions.filter(q => q.skillId === skillId && q.difficulty === level);
}

export function getLevelMode(skillId: string, level: string): string {
  const questions = getQuestionsByLevel(skillId, level);
  const hasCoding = questions.some(q => q.type === "coding");
  return hasCoding ? "Desktop Only" : "Any Device";
}

// QUESTION CRUD
export function getQuestions(): Question[] {
  return QUESTION_SEED_DATA;
}

export function getQuestionById(id: string): Question | null {
  const questions = getQuestions();
  return questions.find((q) => q.id === id) ?? null;
}

export function getQuestionsBySkill(skillId: string): Question[] {
  const questions = getQuestions();
  return questions.filter((q) => q.skillId === skillId);
}

export function createQuestion(payload: CreateQuestionPayload): Question {
  const now = new Date().toISOString();
  const newQuestion = {
    ...payload,
    id: generateId("q"),
    createdAt: now,
    updatedAt: now,
  } as Question;

  QUESTION_SEED_DATA.unshift(newQuestion);
  return newQuestion;
}

export function updateQuestion(id: string, payload: UpdateQuestionPayload): Question | null {
  const questions = getQuestions();
  const index = questions.findIndex((q) => q.id === id);
  if (index === -1) return null;

  const updated = {
    ...questions[index],
    ...payload,
    id,
    skillId: questions[index].skillId,
    updatedAt: new Date().toISOString(),
  } as Question;

  QUESTION_SEED_DATA[index] = updated;
  return updated;
}

export function deleteQuestion(id: string): boolean {
  const questions = getQuestions();
  const index = questions.findIndex((q) => q.id === id);
  if (index === -1) return false;

  QUESTION_SEED_DATA.splice(index, 1);
  return true;
}

/** นับจำนวนทักษะทั้งหมด */
export function getSkillsTotal() {
  return getSkills().length;
}