"use client";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, CircleQuestionMark, Clock, Monitor } from "lucide-react";
import { useEffect, useState } from "react";


export default function SkillDetailPage() {
    const params = useParams();
    const router = useRouter();
    const skillName = decodeURIComponent(params.name as string);

    const skill = {
        name: skillName,
        desc: "SQL (Structured Query Language) คือภาษามาตรฐานที่ใช้สำหรับสื่อสาร จัดการ และดึงข้อมูลจากระบบฐานข้อมูลเชิงสัมพันธ์ (Relational Database) เช่น การค้นหา เพิ่ม หรือลบข้อมูลในตาราง",
        category: "analyst",
        difficulty: "Beginner",
        estimated_time: 45,
        question_count: 15,
        mode: "Desktop Only",
        levels: [
            { id: "Beginner", title: "Beginner", description: "ทำพื้นฐานทั่วไปได้" },
            { id: "Intermediate", title: "Intermediate", description: "สามารถประยุกต์ใช้งานได้" },
            { id: "Advanced", title: "Advanced", description: "เข้าใจจุดแข็งของภาษานี้จริงๆ" }
        ]
    }

    const levelStyles: Record<string, { activeBg: string, textClass: string }> = {
        Beginner: {
            activeBg: "bg-beginnerbg border-beginnertext/40 shadow-sm dark:shadow-beginnertext/20",
            textClass: "text-beginnertext dark:text-[var(--bg-canvas)]",
        },
        Intermediate: {
            activeBg: "bg-intermediatebg border-intermediatetext/40 shadow-sm dark:shadow-intermediatetext/20",
            textClass: "text-intermediatetext dark:text-[var(--bg-canvas)]",
        },
        Advanced: {
            activeBg: "bg-advancedbg border-advancedtext/90 shadow-sm dark:shadow-advancedtext/20",
            textClass: "text-advancedtext dark:text-[var(--bg-canvas)]",
        }
    };

    const categoryTheme: Record<string, string> = {
        analyst: "#3b82f6",
        programming: "#22c55e",
        systems: "#f59e0b",
    };

    const [selectedLevel, setSelectedLevel] = useState(skill.difficulty);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/");
        } else {
            const timer = setTimeout(() => setIsCheckingAuth(false), 100);
            return () => clearTimeout(timer);
        }
    }, [router]);

    if (isCheckingAuth) {
        return (
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-canvas animate-pulse transition-colors duration-300"></div>
        );
    }

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
                        onClick={() => router.back()}
                        className="flex items-center text-text-muted hover:text-text-main transition-colors text-sm font-semibold gap-1 cursor-pointer"
                    >
                        <ChevronLeft size={18} />
                        Back to Skills
                    </button>
                </div>

                {/* Skill Title Hero */}
                <div className="py-10 flex items-center justify-center relative overflow-hidden transition-colors duration-300 bg-[var(--theme-color)]/20">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-text-main z-10 transition-colors duration-300">{skillName}</h1>
                </div>

                <div className="p-8 md:p-12 space-y-10">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: Clock, label: "Duration", value: `${skill.estimated_time} Minutes` },
                            { icon: CircleQuestionMark, label: "Questions", value: `${skill.question_count} Questions` },
                            { icon: Monitor, label: "Mode", value: skill.mode }
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
                        <h2 className="text-2xl font-bold text-text-main transition-colors duration-300">Skill Level</h2>
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            {skill.levels.map((level, index) => {
                                const style = levelStyles[level.id] || levelStyles.Beginner;
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
                        <button className="cursor-pointer bg-brand-secondary hover:bg-brand-secondary-hover text-white font-bold py-4 px-20 rounded-full text-xl shadow-lg shadow-brand-secondary/20 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95">
                            Start
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}