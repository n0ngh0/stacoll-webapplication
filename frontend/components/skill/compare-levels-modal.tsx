"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { SkillLevel, LEVEL_OPTIONS } from "@/types/question";

interface CompareLevelsModalProps {
  levels: SkillLevel[];
  initialTab?: SkillLevel["id"];
  themeColor: string;
  onClose: () => void;
}

export function CompareLevelsModal({ levels, initialTab = "beginner", themeColor, onClose }: CompareLevelsModalProps) {
  const [activeCompareTab, setActiveCompareTab] = useState<SkillLevel["id"]>(initialTab);

  return (
    <div 
      className="fixed inset-0 z-[49] mt-16 flex items-center justify-center bg-canvas/90 backdrop-blur-sm animate-in fade-in duration-200 p-4" 
      style={{ "--theme-color": themeColor } as React.CSSProperties}
      onClick={onClose}
    >
      <div className="bg-surface p-8 rounded-3xl shadow-2xl border border-border-subtle max-w-[800px] w-full h-[85vh] min-h-[500px] flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-extrabold text-text-main mb-6 shrink-0">Compare Skill Levels</h3>

        {/* Tabs */}
        <div className="flex bg-surface-hover p-1.5 rounded-2xl mb-6 shrink-0">
          {(levels || []).map((lvl) => {
            const isActive = activeCompareTab === lvl.id;
            const diff = LEVEL_OPTIONS.find(d => d.value === lvl.id);
            return (
              <button
                key={lvl.id}
                onClick={() => setActiveCompareTab(lvl.id as SkillLevel["id"])}
                className={`flex-1 py-2.5 text-center text-sm font-bold rounded-xl transition-all cursor-pointer ${isActive
                    ? `bg-surface text-${diff?.color} shadow-sm border border-border-subtle`
                    : 'text-text-muted hover:text-text-main'
                  }`}
              >
                {lvl.title}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-hidden flex flex-col pb-4 pr-1">
          {(levels || []).map((lvl) => {
            if (lvl.id !== activeCompareTab) return null;
            const diff = LEVEL_OPTIONS.find(d => d.value === lvl.id);
            return (
              <div key={lvl.id} className="bg-canvas border border-border-subtle rounded-2xl p-6 flex flex-col h-full animate-in fade-in duration-300">
                <div className="flex items-center gap-3 mb-4 shrink-0">
                  <span className={`px-3 py-1 text-[11px] font-black uppercase rounded-lg border text-${diff?.color} border-${diff?.color} bg-${diff?.bg}/30`}>
                    {lvl.title}
                  </span>
                  <h4 className="text-lg font-bold text-text-main">Level Criteria</h4>
                </div>
                <p className="text-sm text-text-muted mb-4 pb-4 border-b border-border-subtle text-balance shrink-0">
                  <strong>Short Summary:</strong> {lvl.description}
                </p>
                <div className="flex-1 overflow-y-auto custom-scrollbar prose prose-sm dark:prose-invert max-w-none text-text-main pr-4">
                  <ReactMarkdown>
                    {lvl.fullDescription || "*No detailed criteria provided.*"}
                  </ReactMarkdown>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-end pt-6 border-t border-border-subtle shrink-0 mt-2">
          <button
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold text-text-main bg-surface border border-border-subtle hover:border-border-strong hover:bg-surface-hover rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}