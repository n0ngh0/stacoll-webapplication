"use client";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, CircleQuestionMark, Clock, Monitor, Loader2, ListChecks, Lock, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { Skill } from "@/types/skill";
import { CompareLevelsModal } from "@/components/skill/compare-levels-modal";



export default function SkillDetailPage() {
    const params = useParams();
    const router = useRouter();
    const skillId = (params?.id || "") as string;

    const [skill, setSkill] = useState<Skill | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLevel, setSelectedLevel] = useState("beginner");
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [showStartModal, setShowStartModal] = useState(false);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [userProgress, setUserProgress] = useState<{
        passedLevels: Record<string, boolean>;
        cooldownLevels: Record<string, { active: boolean; daysRemaining: number }>;
    } | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/");
        } else {
            const timer = setTimeout(() => setIsCheckingAuth(false), 100);
            return () => clearTimeout(timer);
        }
    }, [router]);

    // Fetch skill detail from API
    useEffect(() => {
        if (!isCheckingAuth && skillId) {
            fetchSkillDetail();
        }
    }, [isCheckingAuth, skillId]);

    const fetchSkillDetail = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
            
            const [skillRes, progressRes] = await Promise.all([
                fetch(`${apiUrl}/skills/${skillId}`, { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(`${apiUrl}/assessment/${skillId}/progress`, { headers: { "Authorization": `Bearer ${token}` } })
            ]);
            
            const skillData = await skillRes.json();
            const progressData = await progressRes.json();

            if (skillData.success) {
                setSkill(skillData.skill);
                if (skillData.skill.levels && skillData.skill.levels.length > 0) {
                    setSelectedLevel(skillData.skill.levels[0].level);
                }
            } else {
                console.error("Failed to fetch skill:", skillData.message);
            }
            
            if (progressData.success) {
                setUserProgress({
                    passedLevels: progressData.passedLevels,
                    cooldownLevels: progressData.cooldowns,
                });
            } else {
                console.error("Failed to fetch progress:", progressData.message);
            }
        } catch (error) {
            console.error("Error fetching skill:", error);
        } finally {
            setIsLoading(false);
        }
    };

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

    const categoryTheme: Record<string, string> = {
        analyst: "#3b82f6",
        programming: "#22c55e",
        systems: "#f59e0b",
    };

    const handleStartAssessment = () => {
        setShowStartModal(true);
    }
    const confirmStart = () => {
        setShowStartModal(false);
        router.push(`/assessment/${skillId}?level=${selectedLevel}`);
    }

    if (isCheckingAuth || isLoading) {
        return (
            <div className="flex-1 min-h-screen bg-canvas flex items-center justify-center transition-colors duration-300">
                <Loader2 className="w-10 h-10 animate-spin text-greenui" />
            </div>
        );
    }

    if (!skill) {
        return (
            <div className="flex-1 min-h-screen bg-canvas flex flex-col items-center justify-center transition-colors duration-300">
                <div className="bg-surface border border-border-subtle rounded-2xl p-10 text-center max-w-md">
                    <p className="text-text-muted font-medium text-lg mb-4">Skill not found.</p>
                    <button
                        onClick={() => router.push("/explore")}
                        className="text-greenui font-bold hover:underline cursor-pointer"
                    >
                        Back to Explore
                    </button>
                </div>
            </div>
        );
    }

    // Get current level info for stats
    const currentLevel = skill.levels.find((l) => l.level === selectedLevel) || skill.levels[0];
    const themeColor = categoryTheme[skill.category] || "#19c3af";

    return (
        <div className="flex-1 min-h-screen bg-canvas flex flex-col items-center py-10 px-4 transition-colors duration-300">
            <div
                className="w-full max-w-[850px] bg-surface rounded-[32px] shadow-sm border border-border-subtle overflow-hidden animate-in fade-in zoom-in duration-500 transition-colors duration-300"
                style={{ "--theme-color": themeColor } as React.CSSProperties}
            >
                {/* Header Navigation */}
                <div className="px-8 py-4 border-b border-border-subtle transition-colors duration-300">
                      <button
                        onClick={() => router.push('/explore')}
                        className="flex items-center text-text-muted hover:text-text-main transition-colors text-[13px] font-bold gap-1 cursor-pointer w-fit"
                      >
                        <ChevronLeft size={16} />
                        Back to Explore
                      </button>
                </div>

                {/* Skill Title  */}
                <div className="py-10 flex items-center justify-center relative overflow-hidden transition-colors duration-300 bg-[var(--theme-color)]/20">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-text-main z-10 transition-colors duration-300">{skill.title.toUpperCase()}</h1>
                </div>

                <div className="p-8 md:p-12 space-y-10">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: Clock, label: "Duration", value: `${currentLevel?.estimatedTime ?? 0} Minutes` },
                            { icon: CircleQuestionMark, label: "Questions", value: `${currentLevel?.questionCount ?? 0} Questions` },
                            { icon: Monitor, label: "Mode", value: currentLevel?.mode || "Any Device" }
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
                            {skill.description}
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
                                const style = levelStyles[level.level] || levelStyles.beginner;
                                const isActive = selectedLevel === level.level;
                                const isLocked = index > 0 && !(userProgress?.passedLevels[skill.levels[index - 1].level]);
                                const isPassed = userProgress?.passedLevels[level.level] || false;

                                return (
                                    <div key={level.level} className="flex-1 flex items-center w-full">
                                        <div
                                            onClick={() => {
                                                if (!isLocked) setSelectedLevel(level.level);
                                            }}
                                            title={isLocked ? "Pass the previous level first" : ""}
                                            className={`min-h-[125px] w-full relative p-5 rounded-2xl border-2 transition-all duration-300 text-left flex flex-col gap-2 ${isLocked ? 'cursor-not-allowed bg-canvas border-border-subtle opacity-70 grayscale' : 'cursor-pointer'} ${isActive
                                                ? style.activeBg
                                                : 'bg-canvas border-border-subtle'
                                                }`}
                                        >
                                            {isLocked && <Lock size={28} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-text-muted opacity-60 z-10" />}
                                            {isPassed && <div className="absolute top-3 right-3 text-greenui"><ListChecks size={16} /></div>}
                                            
                                            <div className={`flex items-center gap-3 ${isLocked ? 'opacity-40' : ''}`}>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${isActive
                                                    ? `border-current ${style.textClass}`
                                                    : 'border-border-subtle'
                                                    }`}>
                                                    {isActive && <div className="w-2.5 h-2.5 rounded-full bg-current"></div>}
                                                </div>
                                                <span className={`font-bold transition-colors duration-300 capitalize ${isActive ? style.textClass : 'text-text-main'}`}>
                                                    {level.level}
                                                </span>
                                            </div>
                                            <p className={`text-xs font-medium transition-colors duration-300 ${isActive ? style.textClass : 'text-text-muted opacity-80'} ${isLocked ? 'opacity-40' : ''}`}>
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
                    <div className="flex justify-center pt-4 mb-1">
                        {(() => {
                            const selectedIndex = skill.levels.findIndex((l: any) => l.level === selectedLevel);
                            const isLocked = selectedIndex > 0 && !(userProgress?.passedLevels[skill.levels[selectedIndex - 1].level]);
                            const isPassed = userProgress?.passedLevels[selectedLevel] || false;
                            const cooldown = userProgress?.cooldownLevels[selectedLevel];
                            const cooldownDays = cooldown?.active ? cooldown.daysRemaining : 0;
                            const hasNoQuestions = (currentLevel?.questionCount || 0) === 0;

                            if (isPassed) {
                                return (
                                    <button 
                                        onClick={() => router.push(`/profile/certificate/${skillId.toLowerCase()}`)} 
                                        className="cursor-pointer bg-greenbutton hover:bg-greenbutton/90 text-white dark:text-black font-bold py-4 w-[320px] max-w-full flex justify-center items-center rounded-full text-xl shadow-lg shadow-greenbutton/20 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 gap-2"
                                    >
                                        View Certificate <Award size={20} />
                                    </button>
                                );
                            }

                            if (isLocked) {
                                return (
                                    <button disabled className="bg-canvas border border-border-subtle text-text-muted font-bold py-4 w-[320px] max-w-full flex justify-center items-center rounded-full text-xl shadow-sm cursor-not-allowed gap-2 transition-colors">
                                        <Lock size={20} /> Locked
                                    </button>
                                );
                            }

                            if (cooldownDays > 0) {
                                return (
                                    <div className="flex flex-col items-center w-[320px] max-w-full relative">
                                        <button disabled className="max-h-[60px] w-full bg-canvas border border-accent-orange/40 text-accent-orange/80 font-bold py-4 flex justify-center items-center rounded-full text-xl shadow-sm cursor-not-allowed gap-2 transition-colors">
                                            <Clock size={20} /> Cooldown: {cooldownDays} Days Left
                                        </button>
                                        <p className="text-xs text-text-muted mt-2 font-medium text-center absolute top-full left-0 w-full">You must wait {cooldownDays} days before retaking this assessment.</p>
                                    </div>
                                );
                            }

                            if (hasNoQuestions) {
                                return (
                                    <div className="flex flex-col items-center w-[320px] max-w-full relative">
                                        <button disabled className="max-h-[60px] w-full bg-canvas border border-border-subtle text-text-muted font-bold py-4 flex justify-center items-center rounded-full text-xl shadow-sm cursor-not-allowed gap-2 transition-colors">
                                            <Lock size={20} /> Coming Soon
                                        </button>
                                        <p className="text-xs text-text-muted mt-2 font-medium text-center absolute top-full left-0 w-full">Questions for this level will be available soon.</p>
                                    </div>
                                );
                            }

                            return (
                                <button onClick={handleStartAssessment} className="cursor-pointer bg-brand-secondary hover:bg-brand-secondary-hover text-white font-bold py-4 w-[320px] max-w-full flex justify-center items-center rounded-full text-xl shadow-lg shadow-brand-secondary/20 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 gap-2">
                                    Start Assessment
                                </button>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Custom Start Modal */}
            {showStartModal && (
                <div className="fixed inset-0 z-[49] flex items-center justify-center bg-canvas/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
                    <div className="bg-surface p-8 rounded-3xl shadow-xl border border-border-subtle max-w-md w-full animate-in zoom-in-95 duration-200">

                        <h3 className="text-xl font-bold text-text-main mb-3">Ready to begin?</h3>

                        <p className="text-[15px] text-text-muted leading-relaxed mb-8">
                            You are about to start the <strong className="text-text-main font-bold">{skill.title.toUpperCase()}</strong> assessment
                            at <strong className="capitalize">{selectedLevel}</strong> level.
                            You will have <strong>{currentLevel?.estimatedTime || 30} minutes</strong> to complete <strong>{currentLevel?.questionCount || 15} questions</strong>.
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
                    levels={skill.levels.map((l: any) => ({ ...l, id: l.level, title: l.level })) as any}
                    initialTab={selectedLevel as any}
                    themeColor={themeColor}
                    onClose={() => setShowCompareModal(false)}
                />
            )}
        </div>
    );
}