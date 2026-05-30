"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Calendar, Clock, ArrowRight, MoreVertical, Edit2, Trash2, Database } from "lucide-react";
import type { Skill } from "@/types/question";

interface Props {
    skill: Skill;
    qCount: number;
    themeColor: string;
    onDelete?: (id: string, title: string) => void;
}

function fmt(dateStr?: string) {
    if (!dateStr) return "—";
    try {
        const d = new Date(dateStr);
        return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(d);
    } catch {
        return dateStr;
    }
}

export default function AdminSkillCard({ skill, qCount, themeColor, onDelete }: Props) {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const isImageUrl = (url: string) => url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:");

    useEffect(() => {
        const handle = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, []);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete) onDelete(skill.id, skill.title);
        setMenuOpen(false);
    };

    return (
        <div onClick={() => router.push(`/admin/skills/${skill.id}`)}
            style={{ "--theme-color": themeColor } as React.CSSProperties}
            className={`group bg-surface rounded-xl p-6 shadow-sm flex flex-col transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-[var(--theme-color)]/20 dark:hover:shadow-black/30 border-2 border-[var(--theme-color)]/20 dark:border-[var(--theme-color)]/30 h-full relative cursor-pointer`}
        >
            <div className="flex items-start justify-between mb-3 relative">
                <div className="w-12 h-12 p-2 rounded-xl flex items-center justify-center font-bold text-xl overflow-hidden transition-colors duration-300 bg-[var(--theme-color)]/10 text-[var(--theme-color)] dark:bg-[var(--theme-color)]/15">
                    {isImageUrl(skill.icon) ? (
                        <img src={skill.icon} alt={skill.title} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    ) : (
                        <span className="font-black text-text-muted select-none">{skill.icon || skill.title.substring(0, 3).toUpperCase()}</span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--theme-color)]/10 text-[var(--theme-color)] border border-border-subtle uppercase tracking-wider transition-colors duration-300">
                        {skill.category}
                    </span>

                    <div className="relative" ref={menuRef}>
                        <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }} className="p-1 hover:bg-canvas rounded text-text-muted hover:text-text-main transition-colors focus:outline-none cursor-pointer">
                            <MoreVertical size={16} />
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 top-7 bg-white border border-border-subtle rounded-md shadow-xl w-36 py-1 z-30 text-left animate-in fade-in zoom-in-95 duration-150">
                                <Link href={`/admin/skills/${skill.id}/edit`} onClick={(e) => e.stopPropagation()} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                    <Edit2 size={12} />
                                    Edit Skill
                                </Link>
                                <button onClick={handleDelete} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                                    <Trash2 size={12} />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <h3 className="text-base font-semibold text-text-main mb-1 truncate group-hover/title:text-text-muted transition-colors">{skill.title}</h3>
            <p className="text-sm text-text-muted line-clamp-2 mb-4 flex-grow leading-relaxed">{skill.desc}</p>

            <div className="flex flex-row gap-4 mb-4 pb-3 border-b border-dashed border-border-subtle text-[11px] text-text-muted font-medium">
                <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-gray-400" />
                    <span>Created: {fmt(skill.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-gray-400" />
                    <span>Updated: {fmt(skill.updatedAt)}</span>
                </div>
            </div>

            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 font-medium text-text-main">
                    <Database size={14} className="text-text-muted" />
                    {qCount} <span className="text-text-muted font-normal text-xs">Questions</span>
                </div>
                <div className="text-text-muted hover:text-text-main transition-colors">
                    <ArrowRight size={18} color="var(--theme-color)" />
                </div>
            </div>
        </div>
    );
}
