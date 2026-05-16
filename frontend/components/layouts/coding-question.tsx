"use client";
import { useState, memo } from "react";
import { Play, Terminal, ChevronRight, ChevronLeft, SendHorizontal } from "lucide-react";

interface CodingProps {
  title: string;
  description: React.ReactNode;
  code: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const CodingQuestion = memo(function CodingQuestion({
  title,
  description,
  code,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast
}: CodingProps) {

  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const lineCount = Math.max(20, code.split("\n").length);

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setOutput("Output: 5\nTest Case 1: Passed\nTest Case 2: Passed");
      setIsRunning(false);
    }, 1000);
  };

  return (
    <div className="flex-1 flex overflow-hidden animate-in fade-in duration-500">

      {/* Problem Section */}
      <div className="w-full md:w-[42%] h-full bg-surface border-r border-border-subtle overflow-y-auto p-8 lg:p-10 custom-scrollbar">
        <h2 className="text-2xl font-black text-text-main mb-6 tracking-tight">{title}</h2>
        <div className="prose prose-slate prose-sm max-w-none text-text-muted leading-relaxed">
          {description}
        </div>
      </div>

      {/* IDE & Output Section */}
      <div className="hidden md:flex flex-1 flex-col bg-canvas relative overflow-hidden">

        {/* Code Editor Area */}
        <div className="flex-1 relative flex bg-surface overflow-hidden shadow-inner">
          
          {/* Line Numbers */}
          <div className="w-12 bg-surface-hover border-r border-border-subtle flex flex-col items-end py-6 pr-3 text-text-muted/50 font-mono text-sm select-none overflow-hidden">
            {[...Array(lineCount)].map((_, i) => <div key={i}>{i + 1}</div>)}
          </div>

          <textarea
            value={code}
            onChange={(e) => onChange(e.target.value)}
            spellCheck="false"
            aria-label="Code Editor"
            className="flex-1 bg-surface text-text-main p-6 font-mono text-[15px] leading-relaxed resize-none focus:outline-none focus:ring-0 custom-scrollbar"
            style={{ tabSize: 4 }}
          />
        </div>

        {/* Console Output Section */}
        <div className="h-[280px] bg-canvas border-t-2 border-border-subtle flex flex-col shadow-2xl z-20">

          {/* Console Header & Run Button */}
          <div className="h-12 bg-brand-secondary/10 border-b border-brand-secondary/30 flex items-center justify-between px-5">
            <div className="flex items-center gap-2 text-[13px] font-black text-text-main uppercase tracking-wider">
              <Terminal size={14} className="text-brand-secondary" />
              Console Output
            </div>
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-2 bg-brand-secondary text-white hover:brightness-95 px-4 py-1.5 rounded-lg text-[13px] font-black transition-colors shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Play size={12} fill="currentColor" />
              {isRunning ? "Running..." : "Run Code"}
            </button>
          </div>

          {/* Console Content */}
          <div className="flex-1 p-5 font-mono text-[14px] overflow-y-auto text-text-main bg-surface custom-scrollbar">
            {output ? (
              <pre className="animate-in fade-in slide-in-from-bottom-2 text-green-600 dark:text-green-400 font-bold">
                {output}
              </pre>
            ) : (
              <span className="text-text-muted italic">Click "Run Code" to test your solution...</span>
            )}
          </div>

          {/* Footer Actions */}
          <div className="h-[80px] bg-surface border-t border-border-subtle flex items-center justify-between px-8">
            <div>
              {!isFirst && (
                <button
                  onClick={onBack}
                  className="flex items-center justify-center gap-2 text-text-muted hover:text-text-main font-bold transition-colors px-4 py-3 rounded-xl hover:bg-surface-hover cursor-pointer"
                >
                  <ChevronLeft size={20} />
                  <span>Back</span>
                </button>
              )}
            </div>

            <button
              onClick={onNext}
              className={`flex items-center justify-center gap-2 px-10 py-3.5 rounded-full text-lg font-black transition-colors shadow-md cursor-pointer ${
                isLast
                  ? "bg-greenui text-text-main dark:text-[#1f2937] hover:brightness-105"
                  : "bg-brand-secondary text-white hover:brightness-95"
              }`}
            >
              <span>{isLast ? "Submit" : "Next"}</span>
              {isLast ? <SendHorizontal size={18} className="ml-1" /> : <ChevronRight size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CodingQuestion;