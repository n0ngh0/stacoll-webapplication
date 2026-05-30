"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Pencil, Trash2, Plus, AlertTriangle,
  Settings, Clock, Eye, Code2, ListChecks, Monitor, CircleQuestionMark
} from "lucide-react";
import { getSkillById, deleteSkill, getQuestionsByLevel, deleteQuestion, getLevelMode } from "@/lib/question-store";
import type { Skill, Question, SkillLevel } from "@/types/question";
import { LEVEL_OPTIONS, CATEGORY_THEMES } from "@/types/question"

export default function SkillManagementPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [skill, setSkill] = useState<Skill | null>(null);
  const [activeLevel, setActiveLevel] = useState<SkillLevel["id"]>("beginner");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [levelMode, setLevelMode] = useState<string>("Any Device");

  const [mounted, setMounted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (id) { loadSkill(); }
    setMounted(true);
  }, [id]);

  useEffect(() => {
    if (skill) { loadLevelData(activeLevel); }
  }, [skill, activeLevel]);

  const loadSkill = () => {
    setSkill(getSkillById(id));
  };

  const loadLevelData = (levelId: string) => {
    setQuestions(getQuestionsByLevel(id, levelId));
    setLevelMode(getLevelMode(id, levelId));
  };

  if (!mounted) { return <div className="fixed inset-0 z-[9999] bg-canvas animate-pulse" />; }

  if (!skill) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-text-main mb-3">Skill Not Found</h2>
        <Link href="/admin" className="text-greenui hover:underline font-bold">Back to Dashboard</Link>
      </div>
    );
  }

  const handleDeleteSkill = () => {
    deleteSkill(id);
    router.push("/admin");
  };

  const confirmDeleteQuestion = (qId: string) => {
    deleteQuestion(qId);
    setQuestionToDelete(null);
    loadLevelData(activeLevel);
  };

  const getLevelStyle = (lId: string, isActive: boolean) => {
    if (!isActive) return "text-text-muted border-transparent hover:bg-surface-hover";
    const diff = LEVEL_OPTIONS.find(d => d.value === lId);
    if (!diff) return "";
    return `text-${diff.color} border-${diff.color} bg-${diff.bg}/50`;
  };

  const activeLevelData = skill.levels?.find(l => l.id === activeLevel);
  const isImageUrl = (url: string) => url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:");

  const themeColor = CATEGORY_THEMES[skill.category] || "#19c3af";
  return (
    <div className="min-h-[calc(100vh-80px)] animate-in fade-in slide-in-from-bottom-2 duration-500"
      style={{ "--theme-color": themeColor } as React.CSSProperties}>
      <main className="max-w-[1000px] mx-auto px-[5%] py-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-text-muted hover:text-text-main transition-colors mb-4"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 p-2 rounded-2xl flex items-center justify-center font-bold text-xl shadow-sm overflow-hidden shrink-0 transition-colors duration-300 border border-border-subtle bg-[var(--theme-color)]/10 text-[var(--theme-color)] dark:bg-[var(--theme-color)]/15">
                {isImageUrl(skill.icon) ? (
                  <img src={skill.icon} alt={skill.title} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                ) : (
                  <span className="font-black text-text-muted select-none">{skill.icon || skill.title.substring(0, 3).toUpperCase()}</span>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-extrabold text-text-main tracking-tight">
                  {skill.title}
                </h1>
                <p className="text-text-muted text-sm mt-1">{skill.desc}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 text-xs font-bold">
              <span className="px-2.5 py-1 rounded-full bg-[var(--theme-color)]/10 text-[var(--theme-color)] uppercase border border-border-subtle">
                {skill.category}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/admin/skills/${skill.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface border border-border-subtle text-text-main font-bold rounded-xl text-sm hover:border-brand-secondary-hover hover:text-brand-secondary-hover transition-colors text-center"
            >
              <Settings size={14} /> Edit Skill
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-500 font-bold rounded-xl text-sm hover:bg-red-500/20 transition-colors cursor-pointer"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>

        {/* Level Tabs */}
        <div className="mb-6 flex gap-2 border-b border-border-subtle overflow-x-auto custom-scrollbar">
          {(skill.levels || []).map(level => (
            <button
              key={level.id}
              onClick={() => setActiveLevel(level.id as SkillLevel["id"])}
              className={`px-6 py-3 font-bold text-sm rounded-t-xl border-b-2 transition-all cursor-pointer whitespace-nowrap ${getLevelStyle(level.id, activeLevel === level.id)}`}
            >
              {level.title}
            </button>
          ))}
        </div>

        {/* Active Level Info */}
        {activeLevelData && (
          <div className="bg-surface rounded-2xl border border-border-subtle p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-text-main mb-1">{activeLevelData.title} Level</h3>
              <p className="text-text-muted text-sm">{activeLevelData.description}</p>
            </div>

            <div className="flex gap-4 shrink-0 overflow-x-auto">
              <div className="bg-canvas border border-border-subtle rounded-xl p-3 flex flex-col items-center min-w-[90px]">
                <Clock size={16} className="text-text-muted mb-1" />
                <span className="text-xs font-bold text-text-main">{activeLevelData.estimatedTime} Mins</span>
              </div>
              <div className="bg-canvas border border-border-subtle rounded-xl p-3 flex flex-col items-center min-w-[90px]">
                <CircleQuestionMark size={16} className="text-text-muted mb-1" />
                <span className="text-xs font-bold text-text-main">{questions.length} Qs</span>
              </div>
              <div className="bg-canvas border border-border-subtle rounded-xl p-3 flex flex-col items-center min-w-[90px]">
                <Monitor size={16} className="text-text-muted mb-1" />
                <span className="text-xs font-bold text-text-main">{levelMode}</span>
              </div>
            </div>
          </div>
        )}

        {/* Questions Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
              <ListChecks className="text-greenui" size={24} />
              Questions for {activeLevelData?.title}
            </h2>
            <Link
              href={`/admin/skills/${skill.id}/levels/${activeLevel}/questions/create`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-greenbutton text-white dark:text-black font-extrabold rounded-xl hover:bg-greenbutton/90 transition-colors text-sm cursor-pointer shadow-sm"
            >
              <Plus size={16} /> Add Question
            </Link>
          </div>

          <div className="bg-surface rounded-2xl border border-border-subtle overflow-hidden shadow-sm">
            {questions.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center text-text-muted mb-4">
                  <ListChecks size={32} />
                </div>
                <h3 className="text-lg font-bold text-text-main mb-2">No questions yet in {activeLevelData?.title}</h3>
                <p className="text-text-muted text-sm max-w-md mb-6">
                  Add questions to this level to evaluate candidates.
                </p>
                <Link
                  href={`/admin/skills/${skill.id}/levels/${activeLevel}/questions/create`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-secondary text-white font-bold rounded-xl shadow-md hover:bg-brand-secondary-hover transition-colors"
                >
                  <Plus size={16} /> Create First Question
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-canvas/50 border-b border-border-subtle">
                      <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest w-[1%]">Type</th>
                      <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Title & Snippet</th>
                      <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest w-[1%] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-sm">
                    {questions.map((q) => (
                      <tr key={q.id} className="group hover:bg-surface-hover transition-colors">
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${q.type === 'choice' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-violet-500/10 text-violet-500'
                            }`}>
                            {q.type === 'choice' ? <ListChecks size={12} /> : <Code2 size={12} />}
                            {q.type}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-text-main mb-1 truncate max-w-[300px]">{q.title}</div>
                          <div className="text-xs text-text-muted truncate max-w-[300px]">{q.description}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              href={`/admin/skills/${skill.id}/levels/${activeLevel}/questions/${q.id}`}
                              className="p-2 text-text-muted hover:text-greenbutton hover:bg-greenbutton/10 rounded-lg transition-colors"
                              title="Preview"
                            >
                              <Eye size={16} />
                            </Link>
                            <Link
                              href={`/admin/skills/${skill.id}/levels/${activeLevel}/questions/${q.id}/edit`}
                              className="p-2 text-text-muted hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </Link>
                            <button
                              onClick={() => setQuestionToDelete(q.id)}
                              className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Delete Skill Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[49] flex items-center justify-center bg-canvas/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-surface p-6 rounded-2xl shadow-xl border border-border-subtle max-w-[420px] w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-text-main">Delete Skill</h3>
            </div>
            <p className="text-[14px] text-text-muted leading-relaxed mb-6">
              Are you sure you want to delete <strong className="text-text-main">{skill.title}</strong>?
              <br /><br />
              <span className="text-red-500 font-bold flex items-center gap-1.5"><AlertTriangle size={14} /> This will also delete all questions inside it!</span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 text-sm font-bold text-text-main hover:bg-surface-hover rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSkill}
                className="px-5 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Question Modal */}
      {questionToDelete && (
        <div className="fixed inset-0 z-[49] flex items-center justify-center bg-canvas/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-surface p-6 rounded-2xl shadow-xl border border-border-subtle max-w-[420px] w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-text-main">Delete Question</h3>
            </div>
            <p className="text-[14px] text-text-muted leading-relaxed mb-6">
              Are you sure you want to delete this question? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setQuestionToDelete(null)}
                className="px-5 py-2.5 text-sm font-bold text-text-main hover:bg-surface-hover rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDeleteQuestion(questionToDelete)}
                className="px-5 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
