"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  Save, Eye, EyeOff, Plus,
  Trash2, ListChecks, Code2,
  AlertTriangle, CheckCircle2, Pencil,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import type { Question, ChoiceQuestion, CodingQuestion, Skill } from "@/types/question";

interface QuestionFormProps {
  mode: "create" | "edit";
  skill: Skill;
  levelId: "beginner" | "intermediate" | "advanced";
  initialData?: Question;
  onSubmit: (data: any) => void;
}

export default function QuestionForm({ mode, skill, levelId, initialData, onSubmit }: QuestionFormProps) {
  const router = useRouter();

  // Form state
  const [type, setType] = useState<"choice" | "coding">(initialData?.type || "choice");
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
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
  const [expectedInput, setExpectedInput] = useState(
    initialData?.type === "coding" ? (initialData as CodingQuestion).expectedInput || "" : ""
  );
  const [expectedOutput, setExpectedOutput] = useState(
    initialData?.type === "coding" ? (initialData as CodingQuestion).expectedOutput || "" : ""
  );

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [descTab, setDescTab] = useState<"write" | "preview">("write");

  // Duplicate option detection
  const duplicateIndices = useMemo(() => {
    const indices = new Set<number>();
    const filled = options.map(o => o.trim().toLowerCase());
    for (let i = 0; i < filled.length; i++) {
      if (!filled[i]) continue;
      for (let j = i + 1; j < filled.length; j++) {
        if (filled[i] === filled[j]) {
          indices.add(i);
          indices.add(j);
        }
      }
    }
    return indices;
  }, [options]);

  const getDifficultyStyle = (d: string) => {
    switch (d) {
      case "beginner": return "bg-beginnerbg text-beginnertext";
      case "intermediate": return "bg-intermediatebg text-intermediatetext";
      case "advanced": return "bg-advancedbg text-advancedtext";
      default: return "";
    }
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";

    if (type === "choice") {
      const filledOptions = options.filter((o) => o.trim());
      if (filledOptions.length < 2) { newErrors.options = "At least 2 options required"; }
      if (duplicateIndices.size > 0) newErrors.options = "Options must be unique — remove duplicates";
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
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง");
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);

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
        expectedInput: expectedInput.trim() || undefined,
        expectedOutput: expectedOutput.trim() || undefined,
      };
    }

    try {
      onSubmit(payload);
      toast.success(mode === "create" ? "Question created successfully!" : "Question updated successfully!");

      setTimeout(() => {
        router.push(`/admin/skills/${skill.id}`);
      }, 1000);
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
      setIsSubmitting(false);
    }
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

  const renderPreview = () => {
    if (type === "choice") {
      return (
        <div className="bg-surface rounded-2xl border border-border-subtle overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="text-[11px] font-black text-brand-secondary uppercase tracking-[0.2em] mb-4">Question Description</div>
            <h3 className="text-2xl font-black text-text-main mb-4 tracking-tight leading-tight">{title || "Untitled Question"}</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none text-text-muted leading-relaxed whitespace-pre-wrap mb-6">
              <ReactMarkdown>{description || "*No description*"}</ReactMarkdown>
            </div>
            {codeSnippet && (
              <div className="mb-6">
                <div className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">Code Snippet</div>
                <div className="bg-[#1e293b] dark:bg-[#0f172a] p-5 rounded-xl font-mono text-sm text-slate-200 overflow-x-auto border border-[#334155] custom-scrollbar">
                  <pre>{codeSnippet}</pre>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-border-subtle mx-6 md:mx-8" />

          {/* Answer options */}
          <div className="p-6 md:p-8">
            <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-5">Select your answer:</p>
            <div className="space-y-3">
              {options.filter(o => o.trim()).map((opt, i) => {
                const isCorrect = opt === correctAnswer;
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-colors ${isCorrect
                      ? "bg-surface border-brand-secondary shadow-sm"
                      : "bg-surface border-border-subtle"
                      }`}
                  >
                    <span className={`text-[15px] font-bold ${isCorrect ? "text-text-main" : "text-text-muted"}`}>{opt}</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isCorrect ? "border-brand-secondary bg-brand-secondary" : "border-border-subtle"
                      }`}>
                      {isCorrect && <div className="w-2 h-2 bg-surface rounded-full" />}
                    </div>
                  </div>
                );
              })}
            </div>
            {correctAnswer && (
              <div className="flex items-center gap-2 mt-4 text-xs font-bold text-emerald-500">
                <CheckCircle2 size={14} />
                Correct answer: {correctAnswer}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Coding preview
    return (
      <div className="bg-surface rounded-2xl border border-border-subtle overflow-hidden">
        <div className="flex flex-col md:flex-row md:h-[480px]">
          {/* Problem side */}
          <div className="md:w-[45%] p-6 md:p-8 overflow-y-auto custom-scrollbar border-b md:border-b-0 md:border-r border-border-subtle">
            <h3 className="text-xl font-black text-text-main mb-4 tracking-tight">{title || "Untitled Question"}</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none text-text-muted leading-relaxed whitespace-pre-wrap">
              <ReactMarkdown>{description || "*No description*"}</ReactMarkdown>
            </div>

            {/* Expected I/O section */}
            {(expectedInput || expectedOutput) && (
              <div className="mt-6 space-y-3">
                {expectedInput && (
                  <div>
                    <div className="text-[11px] font-black text-text-muted uppercase tracking-[0.15em] mb-2">Input</div>
                    <div className="bg-canvas border border-border-subtle rounded-lg px-4 py-2.5 font-mono text-sm text-text-main">
                      <pre className="whitespace-pre-wrap">{expectedInput}</pre>
                    </div>
                  </div>
                )}
                {expectedOutput && (
                  <div>
                    <div className="text-[11px] font-black text-text-muted uppercase tracking-[0.15em] mb-2">Output</div>
                    <div className="bg-canvas border border-border-subtle rounded-lg px-4 py-2.5 font-mono text-sm text-text-main">
                      <pre className="whitespace-pre-wrap">{expectedOutput}</pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Code editor side */}
          <div className="flex-1 flex flex-col min-h-[300px] md:min-h-0">
            {/* Editor header */}
            <div className="h-10 bg-surface-hover border-b border-border-subtle flex items-center px-4">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Code Editor</span>
            </div>
            {/* Code content */}
            <div className="flex-1 flex overflow-hidden">
              <div className="w-10 bg-surface-hover flex flex-col items-end py-4 pr-2 text-text-muted/40 font-mono text-sm leading-relaxed select-none overflow-hidden border-r border-border-subtle">
                {(initialCode || "").split("\n").map((_, i) => <div key={i}>{i + 1}</div>)}
              </div>
              <div className="flex-1 bg-surface p-4 font-mono text-sm leading-relaxed text-text-main overflow-auto custom-scrollbar">
                <pre>{initialCode || "// No code yet"}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Test cases */}
        {testCases.filter(t => t.trim()).length > 0 && (
          <div className="border-t border-border-subtle p-6 md:p-8">
            <div className="text-[11px] font-black text-text-muted uppercase tracking-[0.15em] mb-3">Test Cases</div>
            <div className="space-y-2">
              {testCases.filter(t => t.trim()).map((tc, i) => (
                <div key={i} className="flex items-center gap-3 bg-canvas rounded-lg px-4 py-2.5 border border-border-subtle">
                  <span className="text-xs font-mono text-text-muted">{i + 1}</span>
                  <code className="text-sm font-mono text-text-main">{tc}</code>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Toaster position="bottom-right" />

      <div className="min-h-[calc(100vh-80px)] animate-in fade-in slide-in-from-bottom-2 duration-500">
        <main className="max-w-[1100px] mx-auto px-[5%] py-10">

          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/admin/skills/${skill.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-text-muted hover:text-text-main transition-colors mb-3 cursor-pointer"
            >
              <ArrowLeft size={16} />
              Back to Skill
            </Link>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-text-main tracking-tight mb-2">
                  {mode === "create" ? "New Question" : "Edit Question"}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-brand-secondary">{skill.title}</span>
                  <span className="text-text-muted/50">•</span>
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{difficulty} Level</span>
                </div>
              </div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl border transition-all cursor-pointer ${showPreview
                  ? "bg-brand-secondary/10 border-brand-secondary/30 text-brand-secondary"
                  : "border-border-subtle text-text-muted hover:text-text-main hover:bg-surface-hover"
                  }`}
              >
                {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                {showPreview ? "Hide Preview" : "Preview"}
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="mb-8 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-[11px] font-black text-brand-secondary uppercase tracking-[0.2em]">Live Preview</div>
              </div>
              {renderPreview()}
            </div>
          )}

          {/* Form Card */}
          <div className="bg-surface rounded-2xl border border-border-subtle p-6 md:p-8 space-y-8">

            {/* Section: Question Type */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-text-main border-b border-border-subtle pb-2">Question Type</h2>
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
                    <div className="text-xs text-text-muted">Select an answer</div>
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
                    <div className="text-xs text-text-muted">Write code</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Section: General Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-text-main border-b border-border-subtle pb-2">General Information</h2>

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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-text-main">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center rounded-lg border border-border-subtle overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setDescTab("write")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${descTab === "write" ? "bg-surface-hover text-text-main" : "text-text-muted hover:text-text-main"
                        }`}
                    >
                      <Pencil size={12} />
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setDescTab("preview")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${descTab === "preview" ? "bg-surface-hover text-text-main" : "text-text-muted hover:text-text-main"
                        }`}
                    >
                      <Eye size={12} />
                      Preview
                    </button>
                  </div>
                </div>

                {descTab === "write" ? (
                  <div className={`bg-canvas border border-border-subtle rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-secondary/40 transition-shadow ${errors.description ? "ring-2 ring-red-500/40" : ""}`}>
                    <div className="bg-surface-hover border-b border-border-subtle px-4 py-2.5 flex items-center gap-2">
                      <Code2 size={16} className="text-text-muted" />
                      <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Markdown Supported</span>
                    </div>
                    <textarea
                      value={description}
                      onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: "" })); }}
                      placeholder="Description...."
                      rows={6}
                      className={`w-full bg-transparent border-0 px-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 focus:outline-none resize-y font-mono leading-relaxed whitespace-pre-wrap}`}
                    />
                  </div>
                ) : (
                  <div className="bg-canvas border border-border-subtle rounded-xl px-4 py-4 min-h-[160px] prose prose-sm dark:prose-invert max-w-none text-text-main whitespace-pre-wrap">
                    {description.trim() ? (
                      <ReactMarkdown>{description}</ReactMarkdown>
                    ) : (
                      <p className="text-text-muted italic">Nothing to preview</p>
                    )}
                  </div>
                )}
                {errors.description && <p className="text-xs text-red-500 mt-1.5 font-semibold">{errors.description}</p>}
              </div>
            </div>

            {/* === Choice-specific Fields === */}
            {type === "choice" && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-text-main border-b border-border-subtle pb-2">Choice Settings</h2>

                {/* Code Snippet (optional) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-text-main">Code Snippet</label>
                    <span className="px-3 py-1 bg-surface-hover border border-border-subtle text-text-muted text-[10px] uppercase font-black tracking-widest rounded-lg">Optional</span>
                  </div>
                  <div className="bg-canvas border border-border-subtle rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-secondary/40 transition-shadow">
                    <div className="bg-surface-hover border-b border-border-subtle px-4 py-2.5 flex items-center gap-2">
                      <Code2 size={14} className="text-text-muted" />
                      <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Code</span>
                    </div>
                    <textarea
                      value={codeSnippet}
                      onChange={(e) => setCodeSnippet(e.target.value)}
                      placeholder="Paste code snippet that goes with the question..."
                      rows={5}
                      className="w-full bg-transparent px-4 py-3 text-sm text-text-main font-mono placeholder:text-text-muted/50 focus:outline-none resize-y"
                    />
                  </div>
                </div>

                {/* Options */}
                <div>
                  <label className="block text-sm font-bold text-text-main mb-3">
                    Answer Options <span className="text-red-500">*</span>
                  </label>

                  {/* Duplicate warning */}
                  {duplicateIndices.size > 0 && (
                    <div className="flex items-start gap-3 p-4 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300">
                      <div className="mt-0.5"><AlertTriangle size={18} /></div>
                      <div>
                        <div className="text-sm font-bold mb-1">Duplicate Options Detected</div>
                        <div className="text-xs opacity-80">กรุณาแก้ไขตัวเลือกที่ซ้ำกันให้ต่างกัน หรือลบตัวเลือกที่ซ้ำกันออกก่อนบันทึก</div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {options.map((opt, i) => {
                      const isDuplicate = duplicateIndices.has(i);
                      return (
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
                            className={`flex-1 bg-canvas border rounded-xl px-4 py-2.5 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 transition-all ${isDuplicate
                              ? "border-amber-500 bg-amber-500/5"
                              : "border-border-subtle"
                              }`}
                          />

                          {isDuplicate && (
                            <span className="text-amber-500 shrink-0" title="Duplicate option">
                              <AlertTriangle size={16} />
                            </span>
                          )}

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
                      );
                    })}
                  </div>

                  {errors.options && <p className="text-xs text-red-500 mt-1.5 font-semibold">{errors.options}</p>}
                  {errors.correctAnswer && <p className="text-xs text-red-500 mt-1.5 font-semibold">{errors.correctAnswer}</p>}

                  {options.length < 6 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (options.length < 6) addOption();
                      }}
                      className="inline-flex items-center gap-1.5 mt-3 text-sm font-bold text-brand-secondary hover:text-brand-secondary-hover transition-colors cursor-pointer"
                    >
                      <Plus size={14} />
                      Add Option
                    </button>
                  )}

                  <p className="text-xs text-text-muted mt-2">
                    Click the circle to mark the correct answer
                  </p>
                </div>
              </div>
            )}

            {/* === Coding-specific Fields === */}
            {type === "coding" && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-text-main border-b border-border-subtle pb-2">Coding Settings</h2>

                {/* Expected Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-text-main">Expected Input</label>
                    <span className="px-3 py-1 bg-surface-hover border border-border-subtle text-text-muted text-[10px] uppercase font-black tracking-widest rounded-lg">Optional</span>
                  </div>
                  <textarea
                    value={expectedInput}
                    onChange={(e) => setExpectedInput(e.target.value)}
                    placeholder="e.g. nums = [2, 7, 11, 15], target = 9"
                    rows={2}
                    className="w-full bg-canvas border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-main font-mono placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 transition-all resize-y"
                  />
                </div>

                {/* Expected Output */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-text-main">Expected Output</label>
                    <span className="px-3 py-1 bg-surface-hover border border-border-subtle text-text-muted text-[10px] uppercase font-black tracking-widest rounded-lg">Optional</span>
                  </div>
                  <textarea
                    value={expectedOutput}
                    onChange={(e) => setExpectedOutput(e.target.value)}
                    placeholder="e.g. [0, 1]"
                    rows={2}
                    className="w-full bg-canvas border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-main font-mono placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 transition-all resize-y"
                  />
                </div>

                {/* Initial Code */}
                <div>
                  <label className="block text-sm font-bold text-text-main mb-2">
                    Initial Code <span className="text-red-500">*</span>
                  </label>
                  <div className={`bg-canvas border border-border-subtle rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-secondary/40 transition-shadow ${errors.initialCode ? "ring-2 ring-red-500/40" : ""}`}>
                    <div className="bg-surface-hover border-b border-border-subtle px-4 py-2.5 flex items-center gap-2">
                      <Code2 size={14} className="text-text-muted" />
                      <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Starter Code</span>
                    </div>
                    <textarea
                      value={initialCode}
                      onChange={(e) => { setInitialCode(e.target.value); setErrors((p) => ({ ...p, initialCode: "" })); }}
                      placeholder={"def solve():\n    # Write your code here\n    pass"}
                      rows={8}
                      className={`w-full bg-transparent px-4 py-3 text-sm text-text-main font-mono placeholder:text-text-muted/50 focus:outline-none resize-y}`}
                      style={{ tabSize: 4 }}
                    />
                  </div>
                  {errors.initialCode && <p className="text-xs text-red-500 mt-1.5 font-semibold">{errors.initialCode}</p>}
                </div>

                {/* Test Cases */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-bold text-text-main">Test Cases</label>
                    <span className="px-3 py-1 bg-surface-hover border border-border-subtle text-text-muted text-[10px] uppercase font-black tracking-widest rounded-lg">Optional</span>
                  </div>
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
              </div>
            )}

            {/* Actions — matching skill-form style */}
            <div className="h-px bg-border-subtle" />

            <div className="flex items-center justify-end gap-3 pt-2">
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
                disabled={isSubmitting}
                className={`inline-flex items-center gap-1.5 px-8 py-3 bg-greenbutton text-white dark:text-black font-extrabold rounded-xl hover:bg-greenbutton/90 transition-colors text-sm cursor-pointer shadow-sm ${isSubmitting ? "opacity-60 pointer-events-none" : ""}`}
              >
                <Save size={16} />
                {isSubmitting ? "Saving..." : mode === "create" ? "Create Question" : "Save Changes"}
              </button>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}
