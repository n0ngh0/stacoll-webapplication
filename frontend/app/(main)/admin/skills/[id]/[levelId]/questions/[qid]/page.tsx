"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Pencil, Trash2, ListChecks, Code2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getQuestionById, deleteQuestion, getSkillById } from "@/lib/question-store";
import type { Question, ChoiceQuestion, CodingQuestion, Skill } from "@/types/question";

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const skillId = params?.id as string;
  const levelId = params?.levelId as string;
  const qid = params?.qid as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [skill, setSkill] = useState<Skill | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
          <Link
            href={`/admin/skills/${skillId}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-secondary text-white font-bold rounded-xl text-sm"
          >
            <ArrowLeft size={16} /> Back to Skill
          </Link>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    deleteQuestion(question.id);
    router.push(`/admin/skills/${skill.id}?level=${levelId}`);
  };

  const getDifficultyStyle = (d: string) => {
    switch (d) {
      case "beginner": return "bg-beginnerbg text-beginnertext";
      case "intermediate": return "bg-intermediatebg text-intermediatetext";
      case "advanced": return "bg-advancedbg text-advancedtext";
      default: return "";
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] animate-in fade-in slide-in-from-bottom-2 duration-500">
      <main className="max-w-[900px] mx-auto px-[5%] py-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
          <div>
            <Link
              href={`/admin/skills/${skill.id}?level=${levelId}`}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-text-muted hover:text-text-main transition-colors mb-4"
            >
              <ArrowLeft size={16} /> Back to Skill
            </Link>
            <div className="flex items-center gap-4 mb-3">
              <div className={`w-16 h-16 p-2 rounded-2xl flex items-center justify-center font-bold text-xl shadow-sm overflow-hidden shrink-0 transition-colors duration-300 border border-border-subtle ${
                question.type === "choice"
                  ? "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/15"
                  : "bg-violet-500/10 text-violet-500 dark:bg-violet-500/15"
              }`}>
                {question.type === "choice" ? <ListChecks size={28} /> : <Code2 size={28} />}
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-text-main tracking-tight mb-2">
                  {question.title}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded border border-border-subtle text-[10px] font-black uppercase tracking-widest ${
                    question.type === "choice"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-violet-500/10 text-violet-500"
                  }`}>
                    {question.type}
                  </span>
                  <span className="text-text-muted/50">•</span>
                  <span className="text-sm font-bold text-brand-secondary">{skill.title}</span>
                  <span className="text-text-muted/50">•</span>
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{question.difficulty} Level</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/admin/skills/${skill.id}/${levelId}/questions/${question.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface border border-border-subtle text-text-main font-bold rounded-xl text-sm hover:border-brand-secondary-hover hover:text-brand-secondary-hover transition-colors text-center"
            >
              <Pencil size={14} /> Edit
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-500 font-bold rounded-xl text-sm hover:bg-red-500/20 transition-colors cursor-pointer"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-surface rounded-2xl border border-border-subtle overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="text-[11px] font-black text-brand-secondary uppercase tracking-[0.2em] mb-4">Question Description</div>
            <div className="prose prose-sm dark:prose-invert max-w-none text-text-muted leading-relaxed whitespace-pre-wrap">
              <ReactMarkdown>{question.description || "*No description*"}</ReactMarkdown>
            </div>
          </div>

          <div className="h-px bg-border-subtle mx-6 md:mx-8" />

          <div className="p-6 md:p-8">
            {question.type === "choice" && (
              <>
                {(question as ChoiceQuestion).codeSnippet && (
                  <div className="mb-6">
                    <div className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">Code Snippet</div>
                    <div className="bg-[#1e293b] dark:bg-[#0f172a] p-5 rounded-xl font-mono text-sm text-slate-200 overflow-x-auto border border-[#334155]">
                      <pre>{(question as ChoiceQuestion).codeSnippet}</pre>
                    </div>
                  </div>
                )}
                <div className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Answer Options</div>
                <div className="space-y-3">
                  {(question as ChoiceQuestion).options.map((opt, i) => {
                    const isCorrect = opt === (question as ChoiceQuestion).correctAnswer;
                    return (
                      <div key={i} className={`flex items-center justify-between p-4 rounded-xl border-2 ${isCorrect ? "border-emerald-500 bg-emerald-500/5" : "border-border-subtle"}`}>
                        <span className={`text-sm font-bold ${isCorrect ? "text-emerald-500" : "text-text-main"}`}>{opt}</span>
                        {isCorrect && (
                          <div className="flex items-center gap-1.5 text-emerald-500">
                            <CheckCircle2 size={16} /><span className="text-[10px] font-black uppercase">Correct</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {question.type === "coding" && (
              <>
                {/* Expected I/O */}
                {((question as CodingQuestion).expectedInput || (question as CodingQuestion).expectedOutput) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {(question as CodingQuestion).expectedInput && (
                      <div>
                        <div className="text-[11px] font-black text-text-muted uppercase tracking-[0.15em] mb-2">Input</div>
                        <div className="bg-canvas border border-border-subtle rounded-lg px-4 py-2.5 font-mono text-sm text-text-main">
                          <pre className="whitespace-pre-wrap">{(question as CodingQuestion).expectedInput}</pre>
                        </div>
                      </div>
                    )}
                    {(question as CodingQuestion).expectedOutput && (
                      <div>
                        <div className="text-[11px] font-black text-text-muted uppercase tracking-[0.15em] mb-2">Output</div>
                        <div className="bg-canvas border border-border-subtle rounded-lg px-4 py-2.5 font-mono text-sm text-text-main">
                          <pre className="whitespace-pre-wrap">{(question as CodingQuestion).expectedOutput}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mb-6">
                  <div className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">Initial Code</div>
                  <div className="bg-[#1e293b] dark:bg-[#0f172a] p-5 rounded-xl font-mono text-sm text-slate-200 overflow-x-auto border border-[#334155]">
                    <pre>{(question as CodingQuestion).initialCode}</pre>
                  </div>
                </div>
                {(question as CodingQuestion).testCases && (question as CodingQuestion).testCases!.length > 0 && (
                  <div>
                    <div className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">Test Cases</div>
                    <div className="space-y-2">
                      {(question as CodingQuestion).testCases!.map((tc, i) => (
                        <div key={i} className="flex items-center gap-3 bg-canvas rounded-lg px-4 py-2.5 border border-border-subtle">
                          <span className="text-xs font-mono text-text-muted">{i + 1}</span>
                          <code className="text-sm font-mono text-text-main">{tc}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-canvas/80 backdrop-blur-sm p-4">
          <div className="bg-surface p-6 rounded-2xl border border-border-subtle max-w-[420px] w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-text-main">Delete Question</h3>
            </div>
            <p className="text-[14px] text-text-muted mb-6">Are you sure you want to delete this question?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-5 py-2.5 text-sm font-bold text-text-main hover:bg-surface-hover rounded-xl">Cancel</button>
              <button onClick={handleDelete} className="px-5 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
