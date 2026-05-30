"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save, Eye, Plus,
  Trash2, ListChecks, Code2,
  AlertCircle, CheckCircle2, X,
} from "lucide-react";
import { DIFFICULTY_OPTIONS } from "@/types/question";
import type { Question, ChoiceQuestion, CodingQuestion, Skill } from "@/types/question";

interface QuestionFormProps {
  mode: "create" | "edit";
  skill: Skill;
  levelId: "beginner" | "intermediate" | "advanced";
  initialData?: Question;
  onSubmit: (data: any) => void;
}

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-[70] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border animate-in slide-in-from-top-2 fade-in duration-300 ${type === "success"
        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
        : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
      }`}>
      {type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      <span className="text-sm font-bold">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70 cursor-pointer">
        <X size={14} />
      </button>
    </div>
  );
}

export default function QuestionForm({ mode, skill, levelId, initialData, onSubmit }: QuestionFormProps) {
  const router = useRouter();

  // Form state
  const [type, setType] = useState<"choice" | "coding">(initialData?.type || "choice");
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");

  // Difficulty is locked to levelId
  const difficulty = levelId;

  // Choice-specific
  const [options, setOptions] = useState<string[]>(
    initialData?.type === "choice" ? (initialData as ChoiceQuestion).options : ["", "", "", ""]
  );
  const [correctAnswer, setCorrectAnswer] = useState(
    initialData?.type === "choice" ? (initialData as ChoiceQuestion).correctAnswer : ""
  );
  const [codeSnippet, setCodeSnippet] = useState(
    initialData?.type === "choice" ? (initialData as ChoiceQuestion).codeSnippet || "" : ""
  );

  // Coding-specific
  const [initialCode, setInitialCode] = useState(
    initialData?.type === "coding" ? (initialData as CodingQuestion).initialCode : ""
  );
  const [testCases, setTestCases] = useState<string[]>(
    initialData?.type === "coding" ? (initialData as CodingQuestion).testCases || [""] : [""]
  );

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";

    if (type === "choice") {
      const filledOptions = options.filter((o) => o.trim());
      if (filledOptions.length < 2) newErrors.options = "At least 2 options required";
      if (!correctAnswer.trim()) {
        newErrors.correctAnswer = "Select a correct answer";
      } else if (!options.includes(correctAnswer)) {
        newErrors.correctAnswer = "Correct answer must match one of the options";
      }
    }

    if (type === "coding") {
      if (!initialCode.trim()) newErrors.initialCode = "Initial code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      setToast({ message: "กรุณากรอกข้อมูลให้ครบถ้วน", type: "error" });
      return;
    }

    const baseData = {
      type,
      title: title.trim(),
      description: description.trim(),
      skillId: skill.id,
      difficulty,
    };

    let payload;
    if (type === "choice") {
      payload = {
        ...baseData,
        options: options.filter((o) => o.trim()),
        correctAnswer,
        codeSnippet: codeSnippet.trim() || undefined,
      };
    } else {
      payload = {
        ...baseData,
        initialCode,
        testCases: testCases.filter((t) => t.trim()),
      };
    }

    onSubmit(payload);
    setToast({
      message: mode === "create" ? "Question created successfully!" : "Question updated successfully!",
      type: "success",
    });

    // Redirect after short delay
    setTimeout(() => {
      router.push(`/admin/skills/${skill.id}`);
    }, 1000);
  };

  // Option management
  const addOption = () => setOptions([...options, ""]);
  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    const removed = options[index];
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    if (correctAnswer === removed) setCorrectAnswer("");
  };
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    const oldVal = newOptions[index];
    newOptions[index] = value;
    setOptions(newOptions);
    if (correctAnswer === oldVal) setCorrectAnswer(value);
  };

  // Test case management
  const addTestCase = () => setTestCases([...testCases, ""]);
  const removeTestCase = (index: number) => {
    if (testCases.length <= 1) return;
    setTestCases(testCases.filter((_, i) => i !== index));
  };
  const updateTestCase = (index: number, value: string) => {
    const newCases = [...testCases];
    newCases[index] = value;
    setTestCases(newCases);
  };

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="min-h-[calc(100vh-80px)] animate-in fade-in slide-in-from-bottom-2 duration-500">
        <main className="max-w-[900px] mx-auto px-[5%] py-10">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link
                href={`/admin/skills/${skill.id}`}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-text-muted hover:text-text-main transition-colors mb-3"
              >
                <ArrowLeft size={16} />
                Back to Skill
              </Link>
              <h1 className="text-3xl font-extrabold text-text-main tracking-tight">
                {mode === "create" ? "New Question" : "Edit Question"}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl border transition-all cursor-pointer ${showPreview
                    ? "bg-brand-secondary/10 border-brand-secondary/30 text-brand-secondary"
                    : "border-border-subtle text-text-muted hover:text-text-main hover:bg-surface-hover"
                  }`}
              >
                <Eye size={16} />
                Preview
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="bg-surface rounded-2xl border-2 border-brand-secondary/20 p-6 mb-8 animate-in slide-in-from-top-2 duration-300">
              <div className="text-[11px] font-black text-brand-secondary uppercase tracking-[0.2em] mb-4">Preview</div>

              <h2 className="text-2xl font-black text-text-main mb-3">{title || "Untitled Question"}</h2>
              <p className="text-text-muted mb-4 leading-relaxed">{description || "No description"}</p>

              <div className="flex items-center gap-2 flex-wrap mb-6">
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-brand-secondary/10 text-brand-secondary uppercase">
                  {type}
                </span>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${difficulty === "beginner" ? "bg-beginnerbg dark:bg-beginnertext/20 text-beginnertext"
                    : difficulty === "intermediate" ? "bg-intermediatebg dark:bg-intermediatetext/20 text-intermediatetext"
                      : "bg-advancedbg dark:bg-advancedtext/20 text-advancedtext"
                  }`}>
                  {difficulty}
                </span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  {skill.title}
                </span>
              </div>

              {type === "choice" && (
                <>
                  {codeSnippet && (
                    <div className="bg-slate-800 p-4 rounded-xl font-mono text-sm text-slate-200 mb-4 overflow-x-auto">
                      <pre>{codeSnippet}</pre>
                    </div>
                  )}
                  <div className="space-y-2">
                    {options.filter(o => o.trim()).map((opt, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-xl border-2 text-sm font-bold ${opt === correctAnswer
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "border-border-subtle text-text-main"
                          }`}
                      >
                        {opt}
                        {opt === correctAnswer && (
                          <span className="ml-2 text-[10px] font-black uppercase">✓ Correct</span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {type === "coding" && initialCode && (
                <div className="bg-slate-800 p-4 rounded-xl font-mono text-sm text-slate-200 overflow-x-auto">
                  <pre>{initialCode}</pre>
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">

            {/* Type Selector */}
            <div>
              <label className="block text-sm font-bold text-text-main mb-3">Question Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType("choice")}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${type === "choice"
                      ? "border-emerald-500 bg-emerald-500/5 shadow-sm"
                      : "border-border-subtle hover:border-emerald-500/30 hover:bg-surface-hover"
                    }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type === "choice" ? "bg-emerald-500/15 text-emerald-500" : "bg-surface-hover text-text-muted"
                    }`}>
                    <ListChecks size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-text-main text-sm">Choice</div>
                    <div className="text-xs text-text-muted">ปรนัย — เลือกตอบ</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setType("coding")}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${type === "coding"
                      ? "border-violet-500 bg-violet-500/5 shadow-sm"
                      : "border-border-subtle hover:border-violet-500/30 hover:bg-surface-hover"
                    }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type === "coding" ? "bg-violet-500/15 text-violet-500" : "bg-surface-hover text-text-muted"
                    }`}>
                    <Code2 size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-text-main text-sm">Coding</div>
                    <div className="text-xs text-text-muted">เขียนโค้ด — แก้โจทย์</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-text-main mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
                placeholder="e.g. Two Sum, Python Memory Management..."
                className={`w-full bg-canvas border ${errors.title ? "border-red-500" : "border-border-subtle"} rounded-xl px-4 py-3 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 transition-all`}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1.5 font-semibold">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-text-main mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: "" })); }}
                placeholder="Write the question prompt or problem statement..."
                rows={4}
                className={`w-full bg-canvas border ${errors.description ? "border-red-500" : "border-border-subtle"} rounded-xl px-4 py-3 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 transition-all resize-y`}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1.5 font-semibold">{errors.description}</p>}
            </div>

            {/* Divider */}
            <div className="h-px bg-border-subtle" />

            {/* === Choice-specific Fields === */}
            {type === "choice" && (
              <>
                {/* Code Snippet (optional) */}
                <div>
                  <label className="block text-sm font-bold text-text-main mb-2">
                    Code Snippet <span className="text-xs text-text-muted font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    placeholder="Paste code snippet that goes with the question..."
                    rows={5}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 font-mono placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 transition-all resize-y"
                  />
                </div>

                {/* Options */}
                <div>
                  <label className="block text-sm font-bold text-text-main mb-3">
                    Answer Options <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    {options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {/* Radio — select correct */}
                        <button
                          type="button"
                          onClick={() => setCorrectAnswer(opt)}
                          disabled={!opt.trim()}
                          title="Mark as correct answer"
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${correctAnswer === opt && opt.trim()
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-border-subtle hover:border-emerald-500/50"
                            }`}
                        >
                          {correctAnswer === opt && opt.trim() && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </button>

                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateOption(i, e.target.value)}
                          placeholder={`Option ${i + 1}`}
                          className="flex-1 bg-canvas border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 transition-all"
                        />

                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(i)}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {errors.options && <p className="text-xs text-red-500 mt-1.5 font-semibold">{errors.options}</p>}
                  {errors.correctAnswer && <p className="text-xs text-red-500 mt-1.5 font-semibold">{errors.correctAnswer}</p>}

                  <button
                    type="button"
                    onClick={addOption}
                    className="inline-flex items-center gap-1.5 mt-3 text-sm font-bold text-brand-secondary hover:text-brand-secondary-hover transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    Add Option
                  </button>

                  <p className="text-xs text-text-muted mt-2">
                    💡 Click the circle to mark the correct answer
                  </p>
                </div>
              </>
            )}

            {/* === Coding-specific Fields === */}
            {type === "coding" && (
              <>
                {/* Initial Code */}
                <div>
                  <label className="block text-sm font-bold text-text-main mb-2">
                    Initial Code <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={initialCode}
                    onChange={(e) => { setInitialCode(e.target.value); setErrors((p) => ({ ...p, initialCode: "" })); }}
                    placeholder="def solve():\n    # Write your code here\n    pass"
                    rows={8}
                    className={`w-full bg-slate-800 border ${errors.initialCode ? "border-red-500" : "border-slate-700"} rounded-xl px-4 py-3 text-sm text-slate-200 font-mono placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 transition-all resize-y`}
                    style={{ tabSize: 4 }}
                  />
                  {errors.initialCode && <p className="text-xs text-red-500 mt-1.5 font-semibold">{errors.initialCode}</p>}
                </div>

                {/* Test Cases */}
                <div>
                  <label className="block text-sm font-bold text-text-main mb-3">
                    Test Cases <span className="text-xs text-text-muted font-normal">(optional)</span>
                  </label>
                  <div className="space-y-3">
                    {testCases.map((tc, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-xs font-mono text-text-muted mt-3 shrink-0 w-4 text-right">
                          {i + 1}
                        </span>
                        <input
                          type="text"
                          value={tc}
                          onChange={(e) => updateTestCase(i, e.target.value)}
                          placeholder='e.g. assert solve([2,7,11,15], 9) == [0,1]'
                          className="flex-1 bg-canvas border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-main font-mono placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 transition-all"
                        />
                        {testCases.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTestCase(i)}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-colors cursor-pointer mt-0.5"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addTestCase}
                    className="inline-flex items-center gap-1.5 mt-3 text-sm font-bold text-brand-secondary hover:text-brand-secondary-hover transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    Add Test Case
                  </button>
                </div>
              </>
            )}

            {/* Divider */}
            <div className="h-px bg-border-subtle" />

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 pb-8">
              <button
                type="button"
                onClick={() => router.push(`/admin/skills/${skill.id}`)}
                className="px-6 py-3 text-sm font-bold text-text-muted hover:text-text-main hover:bg-surface-hover rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-greenui to-emerald-400 text-gray-900 font-extrabold rounded-xl shadow-lg shadow-greenui/20 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-sm cursor-pointer"
              >
                <Save size={16} />
                {mode === "create" ? "Create Question" : "Save Changes"}
              </button>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
