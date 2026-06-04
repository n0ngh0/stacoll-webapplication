"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SkillForm from "@/components/admin/skill-form";
import type { Skill } from "@/types/skill";
import { apiFetch } from "@/lib/api/client";
import { fetchSkillById } from "@/lib/api/problems";

export default function EditSkillPage() {
  const params = useParams();
  const id = params?.id as string;

  const [skill, setSkill] = useState<Skill | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (id) {
      loadSkill();
    } else {
      setMounted(true);
    }
  }, [id]);

  const loadSkill = async () => {
    try {
      const loaded = await fetchSkillById(id);
      if (loaded) setSkill(loaded);
    } catch (e) {
      console.error(e);
    } finally {
      setMounted(true);
    }
  };

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

  const handleUpdate = async (data: Record<string, unknown>) => {
    const res = await apiFetch(`/admin/skills/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to update skill");
    }
  };

  return <SkillForm mode="edit" initialData={skill} onSubmit={handleUpdate} />;
}
