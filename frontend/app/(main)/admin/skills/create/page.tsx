"use client";
import SkillForm from "@/components/admin/skill-form";
import { createSkill } from "@/lib/question-store";
import type { CreateSkillPayload } from "@/types/question";

export default function CreateSkillPage() {
  const handleCreate = (data: CreateSkillPayload) => {
    createSkill(data);
  };

  return <SkillForm mode="create" onSubmit={handleCreate} />;
}
