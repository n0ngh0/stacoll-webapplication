"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Award, CheckCircle, Clock, ArrowRight, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { SafeMarkdown } from "@/components/SafeMarkdown";
import { CATEGORY_THEMES, getLevelColorClass } from "@/types/question";
import { apiFetch } from "@/lib/api/client";
import { getToken } from "@/lib/auth-session";
import { formatCertDate, getLevelWeight, getWalletEntry } from "@/lib/verified-skills";
import { getAvailableUserLevels } from "@/lib/api/problems";

type CertificateData = {
  name: string;
  category: string;
  level: string;
  score: number;
  date: string;
  expires: string;
  shortDescription: string;
  fullDescription: string;
  statusMessage: string;
};

export default function CertificatePage() {
  const params = useParams();
  const router = useRouter();
  const rawSkillId = (params?.skill || "") as string;

  const [mounted, setMounted] = useState(false);
  const [skillData, setSkillData] = useState<CertificateData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [expiredMessage, setExpiredMessage] = useState("");
  const [isInGrace, setIsInGrace] = useState(false);
  const [graceLevel, setGraceLevel] = useState<string | null>(null);
  const [mustRestart, setMustRestart] = useState(false);
  const [isAtMaxLevel, setIsAtMaxLevel] = useState(false);

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

      const [profileRes, skillRes] = await Promise.all([
        apiFetch("/profile/me"),
        apiFetch(`/skills/${rawSkillId}`),
      ]);
      const profileData = await profileRes.json();
      const skillApiData = await skillRes.json();

      if (profileData.success && profileData.user?.skillWallet) {
        const wallet = getWalletEntry(profileData.user.skillWallet, rawSkillId);

        if (wallet) {
          if (!wallet.effectiveLevel || wallet.effectiveScore === null) {
            if (wallet.isInGracePeriod || wallet.mustRestartFromBeginner || wallet.isFullyExpired) {
              setIsExpired(true);
              setExpiredMessage(wallet.statusMessage);
              setIsInGrace(wallet.isInGracePeriod);
              setGraceLevel(wallet.graceLevel);
              setMustRestart(wallet.mustRestartFromBeginner);
              return;
            }
            setNotFound(true);
            return;
          }

          const skill = skillApiData.success ? skillApiData.skill : null;
          const matchedLevel = skill?.levels?.find(
            (l: { level: string }) =>
              l.level.toLowerCase() === wallet.effectiveLevel!.toLowerCase()
          );

          const availableLevels = getAvailableUserLevels(skill?.levels || []);
          const maxAvailableLevel = availableLevels.reduce(
            (max, l) => (getLevelWeight(l.level) > getLevelWeight(max) ? l.level : max),
            availableLevels[0]?.level ?? "advanced"
          );
          setIsAtMaxLevel(
            getLevelWeight(wallet.effectiveLevel!) >= getLevelWeight(maxAvailableLevel)
          );

          setSkillData({
            name: wallet.skillName,
            category: skill?.category ?? "programming",
            level: wallet.effectiveLevel.toUpperCase(),
            score: wallet.effectiveScore,
            date: wallet.effectiveVerifiedAt
              ? formatCertDate(wallet.effectiveVerifiedAt)
              : "—",
            expires: wallet.effectiveExpiresAt
              ? formatCertDate(wallet.effectiveExpiresAt)
              : "—",
            shortDescription: matchedLevel?.description?.trim() ?? "",
            fullDescription: matchedLevel?.fullDescription?.trim() ?? "",
            statusMessage: wallet.statusMessage,
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

  if (isExpired) {
    const renewHref = isInGrace && graceLevel
      ? `/skill/${rawSkillId}?level=${graceLevel}`
      : `/skill/${rawSkillId}?level=beginner`;

    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-canvas transition-colors duration-300 px-4">
        <div className={`max-w-md w-full bg-surface border rounded-3xl p-8 text-center shadow-sm ${
          isInGrace ? "border-accent-orange/30" : "border-red-500/30"
        }`}>
          <AlertTriangle className={`mx-auto mb-4 ${isInGrace ? "text-accent-orange" : "text-red-500"}`} size={40} />
          <h2 className="text-2xl font-bold text-text-main mb-3">Certificate Expired</h2>
          <p className="text-sm text-text-muted mb-6 leading-relaxed">{expiredMessage}</p>
          <p className="text-xs text-text-muted mb-6">
            {isInGrace
              ? "You have a 10-day grace period to renew your highest level without re-climbing lower levels. After that, you must restart from Beginner."
              : mustRestart
                ? "The grace period has ended. Your assessment history is kept, but you must pass Beginner again to rebuild your certificates."
                : "Renew your assessment to restore verification."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push(renewHref)}
              className="px-6 py-3 bg-brand-secondary hover:bg-brand-secondary-hover text-white font-bold rounded-xl transition-all cursor-pointer"
            >
              {isInGrace ? `Renew ${graceLevel}` : "Restart from Beginner"}
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="px-6 py-3 text-text-main font-bold rounded-xl border border-border-subtle hover:bg-surface-hover transition-all cursor-pointer"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
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
  const competenciesText =
    skillData.fullDescription || skillData.shortDescription || "*No detailed criteria available.*";
  const isFallback = skillData.statusMessage.toLowerCase().includes("expired — showing");

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
          {isFallback && (
            <div className="w-full px-8 mb-8">
              <div className="px-4 py-3 rounded-xl bg-surface/80 border border-accent-orange/30 text-sm text-accent-orange font-medium flex items-start gap-2 shadow-sm backdrop-blur-sm">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <span>{skillData.statusMessage}</span>
              </div>
            </div>
          )}
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
                {competenciesText}
              </SafeMarkdown>
            </div>
          </div>

          {!isAtMaxLevel && (
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
          )}

        </div>
      </div>
    </div>
  );
}
