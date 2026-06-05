"use client";
import { memo } from "react";
import { SafeMarkdown } from "@/components/SafeMarkdown";
import { ChevronRight, ChevronLeft, Send } from "lucide-react";

export interface QuestionData {
    id: number;
    title: string;
    description: string;
    codeSnippet?: string;
    options: { label: string, text: string }[];
}

interface ChoiceProps {
    data: any;
    selected: string | null;
    onChange: (answer: string) => void;
    onNext: () => void;
    onBack: () => void;
    isFirst: boolean;
    isLast: boolean;
}

const ChoiceQuestion = memo(function ChoiceQuestion({
    data,
    selected,
    onChange,
    onNext,
    onBack,
    isFirst,
    isLast
}: ChoiceProps) {

    return (
        <div className="flex-1 flex flex-col bg-canvas overflow-y-auto custom-scrollbar animate-in fade-in duration-500">

            <div className="max-w-3xl mx-auto w-full py-6 px-5 sm:px-6">

                {/* Question Content */}
                <div className="mb-6">
                    <div className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] mb-2">Question Description</div>
                    <h2 className="text-xl font-bold text-text-main mb-3 tracking-tight leading-snug">{data.title}</h2>
                    {data.description?.trim() && (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-text-muted leading-relaxed mb-4 whitespace-pre-wrap">
                            <SafeMarkdown>{data.description}</SafeMarkdown>
                        </div>
                    )}
                    {data.codeSnippet && (
                        <div className="mb-4">
                            <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">Code Snippet</div>
                            <div className="bg-[#1e293b] dark:bg-[#0f172a] p-4 rounded-lg font-mono text-xs text-slate-200 overflow-x-auto border border-[#334155] custom-scrollbar">
                                <pre>{data.codeSnippet}</pre>
                            </div>
                        </div>
                    )}
                </div>

                {/* เส้นคั่น */}
                <div className="h-px bg-border-subtle w-full mb-6" />

                {/* Options */}
                <div className="space-y-3 mb-6">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">Select your answer:</p>

                    <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label="Question options">
                        {(data.options ?? []).map((option: { label: string, text: string }) => {
                            const isSelected = selected === option.label;

                            const buttonBaseClass = "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-colors duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary cursor-pointer";
                            const buttonSelectedClass = isSelected 
                                ? "bg-surface border-brand-secondary shadow-md" 
                                : "bg-surface border-border-subtle hover:bg-surface-hover text-text-muted";

                            return (
                                <button
                                    key={option.label}
                                    role="radio"
                                    aria-checked={isSelected}
                                    onClick={() => onChange(option.label)}
                                    className={`${buttonBaseClass} ${buttonSelectedClass}`}
                                >
                                    <span className={`text-sm font-semibold ${isSelected ? "text-text-main" : ""}`}>
                                        <span className="mr-2 text-text-muted opacity-70">{option.label}.</span>
                                        {option.text}
                                    </span>
                                    {/* วงกลมติ๊กถูก */}
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? "border-brand-secondary bg-brand-secondary" : "border-border-subtle"}`}>
                                        {isSelected && <div className="w-2 h-2 bg-surface rounded-full" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-auto h-[64px] bg-surface border-t border-border-subtle flex items-center justify-between px-6 lg:px-12 shrink-0 sticky bottom-0 z-10">
                
                {/* ปุ่ม Back */}
                <div>
                    {!isFirst && (
                        <button
                            onClick={onBack}
                            className="flex items-center justify-center gap-2 text-text-muted hover:text-text-main font-bold transition-colors px-4 py-3 rounded-xl hover:bg-surface-hover cursor-pointer"
                        >
                            <ChevronLeft size={20} />
                            <span>Previous</span>
                        </button>
                    )}
                </div>

                {/* ปุ่ม Next */}
                <button
                    onClick={onNext}
                    disabled={!selected}
                    className={`flex items-center justify-center gap-2 px-7 py-2.5 rounded-full text-sm font-bold transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                        isLast 
                            ? "bg-greenui text-text-main hover:brightness-105" 
                            : "bg-brand-secondary text-white hover:brightness-95"
                    }`}
                >
                    <span>{isLast ? "Submit Assessment" : "Next"}</span>
                    {isLast ? <Send size={20} className="ml-1" /> : <ChevronRight size={20} />}
                </button>
            </footer>
        </div>
    );
});

export default ChoiceQuestion;