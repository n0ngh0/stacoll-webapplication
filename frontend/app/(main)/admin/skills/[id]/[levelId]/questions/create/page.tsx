"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QuestionForm from "@/components/admin/question-form";
import { createQuestion, getSkillById } from "@/lib/question-store";
import type { CreateQuestionPayload, Skill } from "@/types/question";

export default function CreateQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const skillId = params?.id as string;
  const levelId = params?.levelId as string;
  
  const [skill, setSkill] = useState<Skill | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (skillId) {
      setSkill(getSkillById(skillId));
    }
    setMounted(true);
  }, [skillId]);

  if (!mounted) return null;

  if (!skill) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-text-main mb-3">Skill Not Found</h2>
        <button onClick={() => router.back()} className="text-brand-secondary hover:underline font-bold">Go Back</button>
      </div>
    );
  }

  const handleCreate = (data: CreateQuestionPayload) => {
    createQuestion(data);
  };

  return <QuestionForm mode="create" skill={skill} levelId={levelId as any} onSubmit={handleCreate} />;
}
