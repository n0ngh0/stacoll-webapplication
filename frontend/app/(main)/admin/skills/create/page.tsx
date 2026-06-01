"use client";
import SkillForm from "@/components/admin/skill-form";
import { useRouter } from "next/navigation";

export default function CreateSkillPage() {
  const router = useRouter();

  const handleCreate = async (data: any) => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      
      const res = await fetch(`${apiUrl}/admin/skills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      
      if (result.success) {
        // Form component handles toast and redirect via timeout usually,
        // but we can just throw if failed. We will let form handle success.
      } else {
        throw new Error(result.message || "Failed to create skill");
      }
    } catch (error: any) {
      console.error("Create skill error:", error);
      throw error; // Throw so the form can catch and show error toast if we updated the form
    }
  };

  return <SkillForm mode="create" onSubmit={handleCreate} />;
}
