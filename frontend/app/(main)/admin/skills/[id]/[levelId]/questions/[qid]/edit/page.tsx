"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import QuestionForm from "@/components/admin/question-form";
import { getQuestionById, updateQuestion, getSkillById } from "@/lib/question-store";
import type { Question, UpdateQuestionPayload, Skill } from "@/types/question";

export default function EditQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const skillId = params?.id as string;
  const levelId = params?.levelId as string;
  const qid = params?.qid as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [skill, setSkill] = useState<Skill | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (qid && skillId) {
      setQuestion(getQuestionById(qid));
      setSkill(getSkillById(skillId));
    }
    setMounted(true);
  }, [qid, skillId]);

  if (!mounted) {
    return <div className="fixed inset-0 z-[9999] bg-canvas flex items-center justify-center animate-pulse" />;
  }

  if (!question || !skill) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-main mb-3">Not Found</h2>
          <button onClick={() => router.back()} className="text-brand-secondary hover:underline font-bold">Go Back</button>
        </div>
      </div>
    );
  }

  const handleUpdate = (data: UpdateQuestionPayload) => {
    updateQuestion(qid, data);
  };

  return <QuestionForm mode="edit" skill={skill} levelId={levelId as any} initialData={question} onSubmit={handleUpdate} />;
}
