"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QuestionForm from "@/components/admin/question-form";
import type { CreateQuestionPayload } from "@/types/question";
import type { Skill } from "@/types/skill";
import {
  createAdminProblem,
  fetchSkillById,
  mapFormToProblemPayload,
} from "@/lib/api/problems";

export default function CreateQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const skillId = params?.id as string;
  const levelId = params?.levelId as string;

  const [skill, setSkill] = useState<Skill | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!skillId) return;
      try {
        const loaded = await fetchSkillById(skillId);
        if (loaded) setSkill(loaded);
      } catch (err) {
        console.error("Failed to fetch skill", err);
      } finally {
        setMounted(true);
      }
    };
    load();
  }, [skillId]);

  if (!mounted) return null;

  if (!skill) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-text-main mb-3">Skill Not Found</h2>
        <button onClick={() => router.back()} className="text-brand-secondary hover:underline font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const handleCreate = async (data: CreateQuestionPayload) => {
    try {
      const payload = mapFormToProblemPayload(data, levelId);
      const result = await createAdminProblem(skillId, payload);

      if (result.success) {
        router.push(`/admin/skills/${skillId}?level=${levelId}`);
      } else {
        console.error("Failed to create question:", result.message);
        alert(`Error: ${result.message || result.error || "Failed to create question"}`);
      }
    } catch (err) {
      console.error("Failed to create question", err);
      alert("Something went wrong");
    }
  };

  return <QuestionForm mode="create" skill={skill} levelId={levelId as any} onSubmit={handleCreate} />;
}
