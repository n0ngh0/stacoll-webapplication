"use client";
import { memo, useState } from "react";
import { Clock, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  current: number;
  total: number;
  title: string;
  timeLeft: string;
  isUrgent?: boolean;
  skillId: string;
}

const AssessmentHeader = memo(function AssessmentHeader({
  current,
  total,
  title,
  timeLeft,
  isUrgent = false,
  skillId
}: HeaderProps) {

  const router = useRouter();
  const [showQuitModal, setShowQuitModal] = useState(false);

  const handleConfirmQuit = () => {
    setShowQuitModal(false);
    router.push(`/skill/${skillId}`);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-canvas/90 backdrop-blur-md border-b border-border-subtle shadow-sm transition-colors duration-300">
        <nav className="flex justify-between items-center min-h-[70px] px-6 lg:px-[5%] max-w-[1980px] mx-auto w-full">
          {/* Logo */}
          <div className="flex items-center gap-2 text-2xl font-bold no-underline text-greenui w-1/3">
            <img className="h-10 w-auto object-contain" src="/assets/LogoStacoll.png" alt="Logo" />
            <img className="h-6 w-auto object-contain hidden sm:block" src="/assets/LogoStacoll-Text.png" alt="STACOLL" />
          </div>

          {/* Question Status & Progress */}
          <div className="flex flex-col items-center justify-center w-1/3">
            <div className="text-[13px] font-bold text-brand-secondary mb-0.5" aria-live="polite">
              Question {current} of {total}
            </div>
            <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
              {title}
            </div>

            {/* Progress Bar */}
            <div
              className="flex gap-1.5 mt-2.5"
              role="progressbar"
              aria-valuenow={current}
              aria-valuemin={1}
              aria-valuemax={total}
              aria-label="Assessment progress"
            >
              {[...Array(total)].map((_, i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  className={`h-1.5 w-10 rounded-full transition-colors duration-500 ${i < current ? "bg-brand-secondary" : "bg-border-subtle"
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Timer & Action */}
          <div className="flex items-center justify-end gap-4 w-1/3">
            {/* Timer Box */}
            <div
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[15px] font-black border transition-colors duration-300 ${isUrgent
                ? "bg-red-500/10 border-red-500/20 text-red-500 animate-pulse"
                : "bg-greenui/10 border-greenui/40 text-emerald-700 dark:text-emerald-400"
                }`}
              aria-live={isUrgent ? "assertive" : "off"}
            >
              <Clock size={16} className="shrink-0" />
              <span className="leading-none pt-[2px]">{timeLeft}</span>
            </div>

            {/* Quit Button */}
            <button
              onClick={() => setShowQuitModal(true)}
              aria-label="Quit Assessment"
              className="flex items-center justify-center gap-2 bg-[#DF1013]/20 border border-[#DF1013]/30 text-red-500 hover:bg-[#DF1013]/30 px-4 py-2 rounded-xl text-[14px] font-bold transition-colors active:scale-95 cursor-pointer"
            >
              <X size={16} className="shrink-0" />
              <span className="hidden sm:inline leading-none pt-[2px]">Quit</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Custom Quit Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 z-[49] flex items-center justify-center bg-canvas/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-surface p-6 rounded-2xl shadow-xl border border-border-subtle max-w-[400px] w-full animate-in zoom-in-95 duration-200">

            <h3 className="text-lg font-bold text-text-main mb-2">
              Quit assessment?
            </h3>
            <p className="text-[14px] text-text-muted leading-relaxed mb-8">
              Your progress won't be saved. You'll need to start from the beginning next time.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowQuitModal(false)}
                className="px-5 py-2.5 text-sm font-bold text-text-main hover:bg-surface-hover rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmQuit}
                className="px-5 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Quit Assessment
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
});

export default AssessmentHeader;