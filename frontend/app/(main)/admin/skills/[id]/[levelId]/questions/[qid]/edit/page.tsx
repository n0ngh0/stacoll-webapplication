"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import QuestionForm from "@/components/admin/question-form";
import type { Question, CreateQuestionPayload, UpdateQuestionPayload } from "@/types/question";
import type { Skill } from "@/types/skill";
import {
  fetchAdminProblem,
  fetchSkillById,
  mapFormToProblemPayload,
  mapProblemToForm,
  updateAdminProblem,
} from "@/lib/api/problems";
import { getToken } from "@/lib/auth-session";

export default function EditQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const skillId = params?.id as string;
  const levelId = params?.levelId as string;
  const qid = params?.qid as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [skill, setSkill] = useState<Skill | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!qid || !skillId) return;
      try {
        if (!getToken()) {
          setLoadError("Not authenticated");
          return;
        }

        const [loadedSkill, problem] = await Promise.all([
          fetchSkillById(skillId),
          fetchAdminProblem(qid),
        ]);

        if (loadedSkill) setSkill(loadedSkill);

        if (problem) {
          setQuestion(mapProblemToForm(problem));
        } else {
          setLoadError("Question not found");
        }
      } catch (e) {
        console.error(e);
        setLoadError("Error loading question");
      } finally {
        setMounted(true);
      }
    };
    load();
  }, [qid, skillId]);

  if (!mounted) {
    return <div className="fixed inset-0 z-[9999] bg-canvas flex items-center justify-center animate-pulse" />;
  }

  if (!question || !skill) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-main mb-3">
            {loadError || "Not Found"}
          </h2>
          <button onClick={() => router.back()} className="text-brand-secondary hover:underline font-bold">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleUpdate = async (data: UpdateQuestionPayload) => {
    try {
      const payload = mapFormToProblemPayload(data as CreateQuestionPayload, levelId);
      const result = await updateAdminProblem(qid, payload);

      if (result.success) {
        router.push(`/admin/skills/${skillId}?level=${levelId}`);
      } else {
        alert(`Error: ${result.message || result.error || "Failed to update question"}`);
      }
    } catch (err) {
      console.error("Failed to update question", err);
      alert("Something went wrong");
    }
  };

  return (
    <QuestionForm
      mode="edit"
      skill={skill}
      levelId={levelId as "beginner" | "intermediate" | "advanced"}
      initialData={question}
      onSubmit={handleUpdate}
    />
  );
}
