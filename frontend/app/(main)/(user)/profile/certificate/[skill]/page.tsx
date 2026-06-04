"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Award, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { SafeMarkdown } from "@/components/SafeMarkdown";
import { CATEGORY_THEMES, getLevelColorClass } from "@/types/question";
import { apiFetch } from "@/lib/api/client";
import { getToken } from "@/lib/auth-session";

type CertificateData = {
  name: string;
  category: string;
  level: string;
  score: number;
  date: string;
  expires: string;
  fullDescription: string;
};

export default function CertificatePage() {
  const params = useParams();
  const router = useRouter();
  const rawSkillId = (params?.skill || "") as string;

  const [mounted, setMounted] = useState(false);
  const [skillData, setSkillData] = useState<CertificateData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setMounted(true);
    window.scrollTo(0, 0);
    fetchData();
  }, [rawSkillId]);

  const fetchData = async () => {
    try {
      const token = getToken();
      if (!token) {
        setNotFound(true);
        return;
      }

      const profileRes = await apiFetch("/profile/me");
      const profileData = await profileRes.json();

      if (profileData.success && profileData.user?.verifiedSkills) {
        const vSkill = profileData.user.verifiedSkills.find(
          (s: { skillId: string }) => String(s.skillId) === rawSkillId
        );

        if (vSkill) {
          setSkillData({
            name: vSkill.skillName,
            category: "programming",
            level: vSkill.level.toUpperCase(),
            score: vSkill.score,
            date: new Date(vSkill.verifiedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            }),
            expires: new Date(
              new Date(vSkill.verifiedAt).getTime() + 2 * 365 * 24 * 60 * 60 * 1000
            ).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            }),
            fullDescription:
              "### Competencies\n\n- Demonstrated foundational knowledge\n- Successfully completed all required assessments\n- Met all the criteria for this skill level",
          });
          return;
        }
      }

      setNotFound(true);
    } catch (err) {
      console.error(err);
      setNotFound(true);
    }
  };

  if (!mounted) {
    return <div className="fixed inset-0 z-[9999] bg-canvas animate-pulse transition-colors duration-300"></div>;
  }

  if (notFound || !skillData) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-canvas transition-colors duration-300">
        <h2 className="text-2xl font-bold text-text-main mb-3">Certificate Not Found</h2>
        <p className="text-sm text-text-muted mb-4 text-center max-w-md">
          This certificate is only available for skills you have verified through assessment.
        </p>
        <button onClick={() => router.push("/profile")} className="text-brand-secondary hover:underline font-bold cursor-pointer">
          Back to Profile
        </button>
      </div>
    );
  }

  const themeColor = CATEGORY_THEMES[skillData.category] || "#19c3af";

  return (
    <div className="flex-1 min-h-screen bg-canvas flex flex-col items-center py-10 px-4 transition-colors duration-300">
      <div 
        className="w-full max-w-[850px] bg-surface rounded-[32px] shadow-sm border border-border-subtle overflow-hidden animate-in fade-in zoom-in duration-500 transition-colors duration-300"
        style={{ "--theme-color": themeColor } as React.CSSProperties}
      >
        
        <div className="px-8 py-4 border-b border-border-subtle transition-colors duration-300">
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center text-text-muted hover:text-text-main transition-colors text-sm font-semibold gap-1 cursor-pointer"
          >
            <ChevronLeft size={18} />
            Back to Profile
          </button>
        </div>

        <div 
          className="py-10 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300"
          style={{ backgroundColor: `${themeColor}33` }}
        >
          <span 
            className="px-3 py-1 bg-surface rounded-full text-[10px] font-black uppercase tracking-widest mb-4 shadow-sm border"
            style={{ color: themeColor, borderColor: `${themeColor}50` }}
          >
            {skillData.category}
          </span>
          <div 
            className="w-20 h-20 bg-surface rounded-full shadow-lg flex items-center justify-center mb-6"
            style={{ color: themeColor }}
          >
            <Award size={40} />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-text-main z-10 transition-colors duration-300 uppercase mb-2 text-center text-balance px-4 w-full">
            {skillData.name}
          </h1>
          <p className={`text-lg font-bold tracking-widest ${getLevelColorClass(skillData.level)} transition-colors`}>
            {skillData.level}
          </p>
        </div>

        <div className="p-8 md:p-12 space-y-10">
          <div className="bg-canvas border border-border-subtle rounded-3xl p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 transition-colors duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-secondary/5 rounded-bl-full -z-0"></div>
            
            <div className="z-10 flex-1">
              <h2 className="text-lg font-bold text-text-muted uppercase tracking-wider mb-2 transition-colors">Assessment Score</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-text-main transition-colors">{skillData.score}</span>
                <span className="text-2xl font-bold text-text-muted transition-colors">/ 100</span>
              </div>
              <p className="text-sm text-text-muted mt-4 leading-relaxed transition-colors">
                You have successfully demonstrated proficiency in <strong>{skillData.name}</strong> at the <strong>{skillData.level}</strong> level.
              </p>
            </div>

            <div className="z-10 bg-surface border border-border-subtle rounded-2xl p-6 min-w-[240px] space-y-5 transition-colors duration-300">
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 transition-colors">Verified On</p>
                <div className="flex items-center gap-2 text-text-main font-semibold transition-colors">
                  <CheckCircle size={16} className="text-greenui" />
                  {skillData.date}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 transition-colors">Valid Until</p>
                <div className="flex items-center gap-2 text-accent-orange font-semibold transition-colors">
                  <Clock size={16} />
                  {skillData.expires}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-main transition-colors duration-300">Competencies Demonstrated</h2>
            <div className="bg-canvas p-6 md:p-8 rounded-2xl border border-border-subtle transition-colors duration-300 prose prose-sm md:prose-base dark:prose-invert max-w-none text-text-main">
              <SafeMarkdown>
                {skillData.fullDescription || "*No detailed criteria available.*"}
              </SafeMarkdown>
            </div>
          </div>

          <div className="pt-8 border-t border-border-subtle transition-colors duration-300 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-text-main transition-colors">Ready for the next challenge?</h3>
              <p className="text-sm text-text-muted mt-1 transition-colors">Take the assessment for the next level to upgrade your rank.</p>
            </div>
            
            <button 
              onClick={() => router.push(`/skill/${rawSkillId}`)}
              className="px-6 py-3 bg-brand-secondary hover:bg-brand-secondary-hover text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              Take Next Level Assessment <ArrowRight size={18} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
