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
    <div className="flex-1 pt-24 pb-4 min-h-[calc(100vh-80px)] bg-canvas flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      
      {/* Top Navigation */}
      <div className="absolute top-8 left-8">
        <button
          onClick={() => router.push("/explore")}
          className="flex items-center text-text-muted hover:text-text-main transition-colors text-sm font-bold gap-2 cursor-pointer"
        >
          <ChevronLeft size={20} />
          Back to Explore
        </button>
      </div>

      {/* Background Decorative */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] -z-10 ${isPassed ? 'bg-greenui/10' : 'bg-red-500/10'}`}></div>

      <div className="w-full max-w-2xl bg-surface border border-border-subtle rounded-[32px] shadow-sm p-8 md:p-12 text-center animate-in zoom-in-95 duration-500 relative">
        
        {/* Status Icon */}
        <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg ${bgLightClass}`}>
          <Icon className={colorClass} size={48} />
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-text-main mb-2 transition-colors">
          {isPassed ? "Assessment Passed!" : "Assessment Failed"}
        </h1>
        <p className="text-text-muted text-lg mb-8 transition-colors">
          {isPassed 
            ? `Congratulations! You have successfully demonstrated your skills in ${decodedSkill}.`
            : `Keep practicing! You didn't meet the passing criteria for ${decodedSkill} this time.`}
        </p>

        {/* Score Card */}
        <div className="bg-canvas border border-border-subtle rounded-2xl p-6 flex flex-col items-center justify-center mb-10 transition-colors">
          <p className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Your Score</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-6xl font-black ${colorClass}`}>{result.score}</span>
            <span className="text-2xl font-bold text-text-muted">/ 100</span>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface border border-border-subtle text-xs font-bold text-text-main">
            <Award size={14} className="text-brand-secondary" />
            Level: {result.level}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button
            onClick={() => router.push(`/skill/${rawSkillId}`)}
            className="w-full sm:w-1/2 px-8 py-3.5 rounded-xl font-bold text-text-main bg-canvas border border-border-subtle hover:bg-surface-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Back to Skill
          </button>

          {isPassed ? (
            <button
              onClick={() => router.push(`/profile/certificate/${decodedSkill.toLowerCase()}`)}
              className="w-full sm:w-1/2 px-8 py-3.5 rounded-xl font-bold text-white dark:text-black bg-greenbutton hover:bg-greenbutton/90 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              View Certificate <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={() => router.push(`/skill/${decodedSkill.toLowerCase()}`)}
              className="w-full sm:w-1/2 px-8 py-3.5 rounded-xl font-bold text-white dark:text-black bg-greenbutton hover:bg-greenbutton/90 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Try Again Later <RotateCcw size={18} />
            </button>
          )}
        </div>

        {/* Cooldown notice if failed */}
        {!isPassed && (
          <p className="mt-6 text-sm font-medium text-accent-orange bg-accent-orange/10 p-3 rounded-lg inline-block">
            Note: You must wait 3 days before you can retake this assessment.
          </p>
        )}
      </div>
    </div>
  );
}
