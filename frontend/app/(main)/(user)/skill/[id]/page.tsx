"use client";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, CircleQuestionMark, Clock, Monitor, ListChecks } from "lucide-react";
import { useEffect, useState } from "react";
import { CATEGORY_THEMES } from "@/types/question";
import type { Skill } from "@/types/question";
import { getSkillById, getQuestionsByLevel, getLevelMode } from "@/lib/question-store";
import { CompareLevelsModal } from "@/components/skill/compare-levels-modal";

export default function SkillDetailPage() {
    const params = useParams();
    const router = useRouter();
    const rawSkillId = (params?.id || "skill-assessment") as string;

    const levelStyles: Record<string, { activeBg: string, textClass: string }> = {
        beginner: {
            activeBg: "bg-beginnerbg border-beginnertext/40 shadow-sm dark:shadow-beginnertext/20",
            textClass: "text-beginnertext dark:text-[var(--bg-canvas)]",
        },
        intermediate: {
            activeBg: "bg-intermediatebg border-intermediatetext/40 shadow-sm dark:shadow-intermediatetext/20",
            textClass: "text-intermediatetext dark:text-[var(--bg-canvas)]",
        },
        advanced: {
            activeBg: "bg-advancedbg border-advancedtext/90 shadow-sm dark:shadow-advancedtext/20",
            textClass: "text-advancedtext dark:text-[var(--bg-canvas)]",
        }
    };

    const [mounted, setMounted] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState<string>("beginner");
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [showStartModal, setShowStartModal] = useState(false);
    const [showCompareModal, setShowCompareModal] = useState(false);

    const [skill, setSkill] = useState<Skill | null>(null);
    const [questionCount, setQuestionCount] = useState(0);
    const [levelMode, setLevelMode] = useState("Any Device");
    const [estimatedTime, setEstimatedTime] = useState(0);

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/");
        } else {
            const timer = setTimeout(() => setIsCheckingAuth(false), 100);
            return () => clearTimeout(timer);
        }
    }, [router]);

    useEffect(() => {
        if (mounted && rawSkillId) {
            const fetchedSkill = getSkillById(rawSkillId);
            setSkill(fetchedSkill);
        }
    }, [mounted, rawSkillId]);

    useEffect(() => {
        if (skill && selectedLevel) {
            const questions = getQuestionsByLevel(skill.id, selectedLevel);
            setQuestionCount(questions.length);
            setLevelMode(getLevelMode(skill.id, selectedLevel));
            const levelObj = skill.levels.find(l => l.id === selectedLevel);
            setEstimatedTime(levelObj?.estimatedTime || 45);
        }
    }, [skill, selectedLevel]);


    const handleStartAssessment = () => {
        setShowStartModal(true);
    }
    const confirmStart = () => {
        setShowStartModal(false);
        router.push(`/assessment/${rawSkillId}`);
    }

    if (!mounted || isCheckingAuth) {
        return (
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-canvas animate-pulse transition-colors duration-300"></div>
        );
    }

    if (!skill) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-canvas transition-colors duration-300">
                <h2 className="text-2xl font-bold text-text-main mb-3">Skill Not Found</h2>
                <button onClick={() => router.back()} className="text-brand-secondary hover:underline font-bold cursor-pointer">Back to Skills</button>
            </div>
        );
    }

    const themeColor = CATEGORY_THEMES[skill.category] || "#19c3af";
    return (
        <div className="flex-1 min-h-screen bg-canvas flex flex-col items-center py-10 px-4 transition-colors duration-300">
            <div
                className="w-full max-w-[850px] bg-surface rounded-[32px] shadow-sm border border-border-subtle overflow-hidden animate-in fade-in zoom-in duration-500 transition-colors duration-300"
                style={{ "--theme-color": themeColor } as React.CSSProperties}
            >
                {/* Header Navigation */}
                <div className="px-8 py-4 border-b border-border-subtle transition-colors duration-300">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-text-muted hover:text-text-main transition-colors text-sm font-semibold gap-1 cursor-pointer"
                    >
                        <ChevronLeft size={18} />
                        Back to Skills
                    </button>
                </div>

                {/* Skill Title  */}
                <div className="py-10 flex items-center justify-center relative overflow-hidden transition-colors duration-300 bg-[var(--theme-color)]/20">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-text-main z-10 transition-colors duration-300 uppercase">{skill.title}</h1>
                </div>

                <div className="p-8 md:p-12 space-y-10">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: Clock, label: "Time", value: `${estimatedTime}m` },
                            { icon: CircleQuestionMark, label: "Questions", value: `${questionCount} Questions` },
                            { icon: Monitor, label: "Mode", value: levelMode }
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-canvas border border-border-subtle rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm transition-all duration-300">
                                <div className="w-10 h-10 rounded-full bg-[var(--theme-color)]/15 flex items-center justify-center mb-3 transition-colors duration-300 text-[var(--theme-color)]">
                                    <stat.icon size={20} />
                                </div>
                                <span className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">{stat.label}</span>
                                <span className="text-xl font-bold text-text-main">{stat.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Description Section */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-text-main transition-colors duration-300">Description</h2>
                        <div className="min-h-[122px] bg-canvas border border-border-subtle dark:border-transparent p-6 rounded-2xl text-text-muted text-[15px] leading-relaxed transition-colors duration-300">
                            {skill.desc}
                        </div>
                    </div>

                    {/* Skill Level Section */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h2 className="text-2xl font-bold text-text-main transition-colors duration-300">Skill Level</h2>
                            <button
                                onClick={() => setShowCompareModal(true)}
                                className="inline-flex items-center justify-center gap-2 text-xs font-bold text-[var(--theme-color)] hover:bg-[var(--theme-color)]/20 bg-[var(--theme-color)]/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                                <ListChecks size={14} />
                                View Full Criteria
                            </button>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            {skill.levels.map((level, index) => {
                                const style = levelStyles[level.id] || levelStyles.beginner;
                                const isActive = selectedLevel === level.id;

                                return (
                                    <div key={level.id} className="flex-1 flex items-center w-full">
                                        <div
                                            className={`min-h-[125px] w-full relative p-5 rounded-2xl border-2 transition-all duration-300 text-left flex flex-col gap-2 ${isActive
                                                ? style.activeBg
                                                : 'bg-canvas border-border-subtle'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${isActive
                                                    ? `border-current ${style.textClass}`
                                                    : 'border-border-subtle'
                                                    }`}>
                                                    {isActive && <div className="w-2.5 h-2.5 rounded-full bg-current"></div>}
                                                </div>
                                                <span className={`font-bold transition-colors duration-300 ${isActive ? style.textClass : 'text-text-main'}`}>
                                                    {level.title}
                                                </span>
                                            </div>
                                            <p className={`text-xs font-medium transition-colors duration-300 ${isActive ? style.textClass : 'text-text-muted opacity-80'}`}>
                                                {level.description}
                                            </p>
                                        </div>

                                        {index < skill.levels.length - 1 && (
                                            <div className="hidden md:block mx-2 text-text-muted transition-colors duration-300">
                                                <ChevronLeft size={20} className="rotate-180 opacity-50" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-center pt-6">
                        <button onClick={handleStartAssessment} className="cursor-pointer bg-brand-secondary hover:bg-brand-secondary-hover text-white font-bold py-4 px-20 rounded-full text-xl shadow-lg shadow-brand-secondary/20 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95">
                            Start
                        </button>
                    </div>
                </div>
            </div>

            {/* Custom Start Modal */}
            {showStartModal && (
                <div className="fixed inset-0 z-[49] flex items-center justify-center bg-canvas/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
                    <div className="bg-surface p-8 rounded-3xl shadow-xl border border-border-subtle max-w-md w-full animate-in zoom-in-95 duration-200">

                        <h3 className="text-xl font-bold text-text-main mb-3">Ready to begin?</h3>

                        <p className="text-[15px] text-text-muted leading-relaxed mb-8">
                            You are about to start the <strong className="text-text-main font-bold">{skill.title}</strong> assessment.
                            You will have <strong>{estimatedTime} minutes</strong> to complete <strong>{questionCount} questions</strong>.
                            The timer cannot be paused once started.
                        </p>

                        <div className="flex flex-col-reverse sm:flex-row gap-3">
                            <button
                                onClick={() => setShowStartModal(false)}
                                className="flex-1 px-5 py-3 text-[15px] font-bold text-text-main hover:bg-surface-hover rounded-xl transition-colors cursor-pointer border border-border-subtle sm:border-transparent"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmStart}
                                className="flex-1 px-5 py-3 text-[15px] font-bold text-white bg-brand-secondary hover:brightness-105 rounded-xl transition-colors shadow-sm cursor-pointer"
                            >
                                Start Assessment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Compare Levels Modal */}
            {showCompareModal && (
                <CompareLevelsModal
                    levels={skill.levels as any}
                    initialTab={selectedLevel as any}
                    themeColor={themeColor}
                    onClose={() => setShowCompareModal(false)}
                />
            )}
        </div>
    );
}