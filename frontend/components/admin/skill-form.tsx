"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Upload, ImageIcon, Trash } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { CATEGORY_OPTIONS } from "@/types/question";
import type { Skill } from "@/types/question";

interface SkillFormProps {
  mode: "create" | "edit";
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
}

export default function SkillForm({ mode, initialData, onSubmit }: SkillFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [desc, setDesc] = useState(initialData?.description || initialData?.desc || "");
  const [icon, setIcon] = useState(initialData?.icon || "");
  const [category, setCategory] = useState<any>(initialData?.category || "programming");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!desc.trim()) newErrors.desc = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง");
      return;
    }

    const payload = {
      title: title.trim(),
      description: desc.trim(),
      icon: icon.trim() || title.trim().substring(0, 3).toUpperCase(),
      category,
    };

    try {
      await onSubmit(payload);
      toast.success(mode === "create" ? "Skill created successfully!" : "Skill updated successfully!");

      setTimeout(() => {
        router.push(mode === "create" ? "/admin" : `/admin/skills/${initialData?._id}`);
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    }
  };

  const isImageUrl = (url: string) => url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:");

  return (
    <>
      <Toaster position="bottom-right" />

      <div className="min-h-[calc(100vh-80px)] animate-in fade-in slide-in-from-bottom-2 duration-500">
        <main className="max-w-[800px] mx-auto px-[5%] py-10">

          <div className="mb-8">
            <Link
              href={mode === "create" ? "/admin" : `/admin/skills/${initialData?._id}`}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-text-muted hover:text-text-main transition-colors mb-3 cursor-pointer"
            >
              <ArrowLeft size={16} />
              {mode === "create" ? "Back to Dashboard" : "Back to Skill"}
            </Link>
            <h1 className="text-3xl font-extrabold text-text-main tracking-tight">
              {mode === "create" ? "Create New Skill" : "Edit Skill"}
            </h1>
          </div>

          <div className="bg-surface rounded-2xl border border-border-subtle p-6 md:p-8 space-y-8">

            <div className="space-y-6">
              <h2 className="text-lg font-bold text-text-main border-b border-border-subtle pb-2">General Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-text-main mb-2">Skill Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
                    placeholder="e.g. React, Docker, SQL"
                    className={`w-full bg-canvas border ${errors.title ? "border-red-500" : "border-border-subtle"} rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 transition-all`}
                  />
                  {errors.title && <p className="text-xs text-red-500 mt-1.5 font-semibold">{errors.title}</p>}
                </div>

                {/* Icon */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-text-main mb-2">Logo</label>
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center p-5 rounded-2xl border border-border-subtle bg-canvas/40 backdrop-blur-sm">
                    {/* Preview Box */}
                    <div className="relative w-20 h-20 rounded-2xl bg-surface border border-border-subtle flex items-center justify-center shrink-0 overflow-hidden shadow-sm group">
                      {isImageUrl(icon) ? (
                        <>
                          <img src={icon} alt="Logo preview" className="p-2 w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                          <button
                            type="button"
                            onClick={() => setIcon("")}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Trash className="text-white w-6 h-6" />
                          </button>
                        </>
                      ) : (
                        <span className="font-black text-2xl text-text-muted select-none">
                          {icon || title.trim().substring(0, 3).toUpperCase() || <ImageIcon className="w-8 h-8 opacity-40" />}
                        </span>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          id="mock-upload"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setIcon(URL.createObjectURL(file));
                          }}
                        />
                        <label
                          htmlFor="mock-upload"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface border border-border-subtle text-text-main rounded-xl text-sm font-bold hover:bg-surface-hover hover:border-border-strong transition-all cursor-pointer shadow-sm"
                        >
                          <Upload size={16} />
                          Choose Image
                        </label>
                        {isImageUrl(icon) && (
                          <button
                            type="button"
                            onClick={() => setIcon("")}
                            className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors px-2 py-1 cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed max-w-md">
                        อัพโหลดรูปภาพสำหรับ Logo Skill (แนะนำขนาด 256x256px)<br />
                        <span className="opacity-80">ถ้าไม่อัพโหลด ระบบจะดึงเอา 3 ตัวอักษรแรกของชื่อมาใช้แทน</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-text-main mb-2">Description <span className="text-red-500">*</span></label>
                  <textarea
                    value={desc}
                    onChange={(e) => { setDesc(e.target.value); setErrors((p) => ({ ...p, desc: "" })); }}
                    placeholder="Brief description of the skill..."
                    rows={3}
                    className={`w-full bg-canvas border ${errors.desc ? "border-red-500" : "border-border-subtle"} rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 transition-all resize-y`}
                  />
                  {errors.desc && <p className="text-xs text-red-500 mt-1.5 font-semibold">{errors.desc}</p>}
                </div>

                {/* Category */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-text-main mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-canvas border border-border-subtle rounded-xl px-4 py-3 text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-secondary/40"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="h-px bg-border-subtle my-6" />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 text-sm font-bold text-text-muted hover:text-text-main hover:bg-surface-hover rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-1.5 px-8 py-3 bg-greenbutton text-white dark:text-black font-extrabold rounded-xl hover:bg-greenbutton/90 transition-colors text-sm cursor-pointer shadow-sm"
              >
                {mode === "create" ? "Create Skill" : "Save Changes"}
              </button>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}
