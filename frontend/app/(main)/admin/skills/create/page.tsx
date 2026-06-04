"use client";
import SkillForm from "@/components/admin/skill-form";
import { apiFetch } from "@/lib/api/client";

export default function CreateSkillPage() {
  const handleCreate = async (data: Record<string, unknown>) => {
    const res = await apiFetch("/admin/skills", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to create skill");
    }
  };

  return <SkillForm mode="create" onSubmit={handleCreate} />;
}
