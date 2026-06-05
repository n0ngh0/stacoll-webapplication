"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, ChevronLeft, Award, ArrowRight, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

export default function AssessmentResultPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const rawSkillId = (params?.id || "") as string;
  const decodedSkill = decodeURIComponent(rawSkillId);

  // Mock reading from URL parameters or defaults
  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState({
    score: parseInt(searchParams?.get("score") || "85"),
    passed: searchParams?.get("passed") !== "false",
    level: searchParams?.get("level") || "BEGINNER",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="fixed inset-0 bg-canvas animate-pulse"></div>;

  const isPassed = result.passed;
  const colorClass = isPassed ? "text-greenui" : "text-red-500";
  const bgLightClass = isPassed ? "bg-greenui/10" : "bg-red-500/10";
  const Icon = isPassed ? CheckCircle : XCircle;

  return (
    <div className="flex-1 pt-16 pb-6 min-h-screen bg-canvas flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden transition-colors duration-300">
      
      {/* Top Navigation */}
      <div className="absolute top-5 left-5 sm:top-6 sm:left-6">
        <button
          onClick={() => router.push("/explore")}
          className="flex items-center text-text-muted hover:text-text-main transition-colors text-xs font-bold gap-1.5 cursor-pointer"
        >
          <ChevronLeft size={16} />
          Back to Explore
        </button>
      </div>

      {/* Background Decorative */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px] -z-10 ${isPassed ? 'bg-greenui/10' : 'bg-red-500/10'}`}></div>

      <div className="w-full max-w-md bg-surface border border-border-subtle rounded-2xl shadow-sm p-6 sm:p-8 text-center animate-in zoom-in-95 duration-500 relative">
        
        {/* Status Icon */}
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-md ${bgLightClass}`}>
          <Icon className={colorClass} size={32} />
        </div>

        {/* Heading */}
        <h1 className="text-xl sm:text-2xl font-extrabold text-text-main mb-1.5 transition-colors">
          {isPassed ? "Assessment Passed!" : "Assessment Failed"}
        </h1>
        <p className="text-text-muted text-sm mb-5 leading-relaxed transition-colors">
          {isPassed 
            ? `Congratulations! You have successfully demonstrated your skills in ${decodedSkill}.`
            : `Keep practicing! You didn't meet the passing criteria for ${decodedSkill} this time.`}
        </p>

        {/* Score Card */}
        <div className="bg-canvas border border-border-subtle rounded-xl p-4 flex flex-col items-center justify-center mb-6 transition-colors">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Your Score</p>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-4xl font-black ${colorClass}`}>{result.score}</span>
            <span className="text-lg font-bold text-text-muted">/ 100</span>
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-surface border border-border-subtle text-[11px] font-bold text-text-main">
            <Award size={12} className="text-brand-secondary" />
            Level: {result.level}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => router.push(`/skill/${rawSkillId}`)}
            className="w-full sm:flex-1 px-5 py-2.5 rounded-lg text-sm font-bold text-text-main bg-canvas border border-border-subtle hover:bg-surface-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Back to Skill
          </button>

          {isPassed ? (
            <button
              onClick={() => router.push(`/profile/certificate/${decodedSkill.toLowerCase()}`)}
              className="w-full sm:flex-1 px-5 py-2.5 rounded-lg text-sm font-bold text-white dark:text-black bg-greenbutton hover:bg-greenbutton/90 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              View Certificate <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => router.push(`/skill/${decodedSkill.toLowerCase()}`)}
              className="w-full sm:flex-1 px-5 py-2.5 rounded-lg text-sm font-bold text-white dark:text-black bg-greenbutton hover:bg-greenbutton/90 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Try Again Later <RotateCcw size={16} />
            </button>
          )}
        </div>

        {/* Cooldown notice if failed */}
        {!isPassed && (
          <p className="mt-4 text-xs font-medium text-accent-orange bg-accent-orange/10 px-3 py-2 rounded-lg inline-block">
            Note: You must wait 3 days before you can retake this assessment.
          </p>
        )}
      </div>
    </div>
  );
}
