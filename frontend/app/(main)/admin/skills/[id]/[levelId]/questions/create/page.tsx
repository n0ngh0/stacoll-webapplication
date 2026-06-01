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
    const fetchSkill = async () => {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        const res = await fetch(`${apiUrl}/skills/${skillId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.skill) {
          // Adapt DB skill to UI skill format expected by QuestionForm
          setSkill({
            id: data.skill._id,
            title: data.skill.title,
            icon: data.skill.icon,
            desc: data.skill.description,
            category: data.skill.category,
            levels: data.skill.levels.map((l: any) => ({
              id: l.level,
              title: l.level.charAt(0).toUpperCase() + l.level.slice(1),
              description: l.description,
              estimatedTime: l.estimatedTime
            }))
          } as any);
        }
      } catch (err) {
        console.error("Failed to fetch skill", err);
      } finally {
        setMounted(true);
      }
    };
    if (skillId) {
      fetchSkill();
    }
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

  const handleCreate = async (data: CreateQuestionPayload) => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      
      let typeSpecificFields: any = {};
      if (data.type === "choice") {
          typeSpecificFields = {
              options: data.options,
              correctAnswer: data.correctAnswer,
              codeSnippet: data.codeSnippet
          };
      } else {
          typeSpecificFields = {
              languageId: data.languageId,
              templateCode: data.templateCode,
              testCases: data.testCases
          };
      }

      const payload = {
        skillId,
        level: levelId,
        question: data.title,
        questionType: data.type,
        explanation: data.description,
        ...typeSpecificFields
      };

      const res = await fetch(`${apiUrl}/admin/skills/${skillId}/problems`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      if (result.success) {
        // Go back to the skill management page
        router.push(`/admin/skills/${skillId}`);
      } else {
        console.error("Failed to create question:", result.message);
        alert(`Error: ${result.message}`);
      }
    } catch (err) {
      console.error("Failed to create question", err);
      alert("Something went wrong");
    }
  };

  return <QuestionForm mode="create" skill={skill} levelId={levelId as any} onSubmit={handleCreate} />;
}
