"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SkillForm from "@/components/admin/skill-form";
import { getSkillById, updateSkill } from "@/lib/question-store";
import type { Skill, UpdateSkillPayload } from "@/types/question";

export default function EditSkillPage() {
  const params = useParams();
  const id = params?.id as string;

  const [skill, setSkill] = useState<Skill | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (id) {
      setSkill(getSkillById(id));
    }
    setMounted(true);
  }, [id]);

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-[9999] bg-canvas flex items-center justify-center animate-pulse" />
    );
  }

  if (!skill) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-main mb-3">Skill Not Found</h2>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-secondary text-white font-bold rounded-xl text-sm"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleUpdate = (data: UpdateSkillPayload) => {
    updateSkill(id, data);
  };

  return <SkillForm mode="edit" initialData={skill} onSubmit={handleUpdate} />;
}
