"use client";
import Link from "next/link";
import React from "react";
import type { Skill } from "@/types/question";
import { ArrowRight } from "lucide-react";

export default function SkillCard({ skill, themeColor }: { skill: Skill; themeColor: string }) {
    const isImageUrl = (url: string) => url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:");

    return (
        <Link
            href={`/skill/${skill.id}`}
            style={{ "--theme-color": themeColor } as React.CSSProperties}
            className="group bg-surface rounded-xl p-6 shadow-sm flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--theme-color)]/20 dark:hover:shadow-black/30 cursor-pointer border-2 border-[var(--theme-color)]/20 dark:border-[var(--theme-color)]/30"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 p-2 rounded-xl flex items-center justify-center font-bold text-xl overflow-hidden transition-colors duration-300 bg-[var(--theme-color)]/10 text-[var(--theme-color)] dark:bg-[var(--theme-color)]/15">
                    {isImageUrl(skill.icon) ? (
                        <img src={skill.icon} alt={skill.title} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    ) : (
                        <span className="font-black text-text-muted select-none">{skill.icon || skill.title.substring(0, 3).toUpperCase()}</span>
                    )}
                </div>

                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--theme-color)]/10 text-[var(--theme-color)] border border-border-subtle uppercase tracking-wider transition-colors duration-300">
                    {skill.category}
                </span>
            </div>

            <h3 className="text-[22px] font-bold text-text-main mb-2 transition-colors duration-300">{skill.title}</h3>
            <p className="text-[13.5px] text-text-muted leading-relaxed mb-6 grow transition-colors duration-300">{skill.desc}</p>

            <div className="mb-4 border-b border-dashed border-border-subtle" />

            <div className="flex justify-between items-center mt-auto">
                <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-beginnerbg dark:bg-beginnertext/20 text-beginnertext uppercase transition-colors duration-300">Beginner</span>
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-intermediatebg dark:bg-intermediatetext/20 text-intermediatetext uppercase transition-colors duration-300">Intermediate</span>
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-advancedbg dark:bg-advancedbg/20 text-advancedtext uppercase transition-colors duration-300">Advanced</span>
                </div>
                <div className="text-text-muted hover:text-text-main transition-colors">
                    <ArrowRight size={18} color="var(--theme-color)" />
                </div>
            </div>
        </Link>
    );
}
