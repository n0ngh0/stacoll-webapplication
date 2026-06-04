"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Award, CheckCircle, Clock, Search, ExternalLink, Activity, AlertTriangle, History, Loader2 } from "lucide-react";

import { getLevelColorClass } from "@/types/question";
import { apiFetch } from "@/lib/api/client";
import { getToken } from "@/lib/auth-session";
import { formatCertDate } from "@/lib/verified-skills";

export default function MySkillPage() {
  const [activeTab, setActiveTab] = useState<"verified" | "pending" | "history">("verified");
  const [searchQuery, setSearchQuery] = useState("");

    const [skills, setSkills] = useState<any[]>([]);
    const [expiredSkills, setExpiredSkills] = useState<any[]>([]);
    const [pendingRetakes, setPendingRetakes] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!getToken()) return;

                const [profileRes, historyRes] = await Promise.all([
                    apiFetch("/profile/me"),
                    apiFetch("/assessment/history"),
                ]);
                
                // Read text first to handle non-JSON error responses gracefully
                const profileText = await profileRes.text();
                const historyText = await historyRes.text();

                let profileData: any = { success: false, user: { verifiedSkills: [] } };
                let historyData: any = { success: false, history: [] };

                try { profileData = JSON.parse(profileText); } catch (e) { console.error("Profile parse error:", profileText); }
                try { historyData = JSON.parse(historyText); } catch (e) { console.error("History parse error:", historyText); }

                if (profileData.success) {
                    const wallet = profileData.user.skillWallet || [];
                    setSkills(
                      wallet
                        .filter((w: any) => !w.isFullyExpired)
                        .map((w: any) => ({
                          id: w.skillId,
                          name: w.skillName,
                          level: (w.effectiveLevel || "").toUpperCase(),
                          score: w.effectiveScore,
                          date: w.effectiveVerifiedAt ? formatCertDate(w.effectiveVerifiedAt) : "—",
                          expires: w.effectiveExpiresAt ? formatCertDate(w.effectiveExpiresAt) : "—",
                          statusMessage: w.statusMessage,
                        }))
                    );
                    setExpiredSkills(
                      wallet
                        .filter((w: any) => w.isFullyExpired)
                        .map((w: any) => ({
                          id: w.skillId,
                          name: w.skillName,
                          statusMessage: w.statusMessage,
                          isInGracePeriod: w.isInGracePeriod,
                          graceLevel: w.graceLevel,
                          mustRestartFromBeginner: w.mustRestartFromBeginner,
                        }))
                    );
                }

                if (historyData.success) {
                    const allHistory = historyData.history.map((h: any) => ({
                        id: h.skillId?._id,
                        name: h.skillId?.title || "Unknown Skill",
                        level: h.level,
                        score: h.score,
                        status: h.passed ? "PASSED" : "FAILED",
                        date: new Date(h.createdAt).toLocaleDateString(),
                        createdAt: h.createdAt
                    }));
                    setHistory(allHistory);

                    // Calculate pending retakes
                    const latestFails: Record<string, any> = {};
                    for (const h of historyData.history) {
                        const key = `${h.skillId?._id}_${h.level}`;
                        // Since history is sorted by createdAt desc, we want to know if the most recent attempt is failed
                        // Actually, if they passed it later, it's not pending.
                        if (!latestFails[key]) {
                            latestFails[key] = h;
                        }
                    }

                    const pending = [];
                    for (const [key, attempt] of Object.entries(latestFails)) {
                        if (!attempt.passed) {
                            const timePassed = Date.now() - new Date(attempt.createdAt).getTime();
                            const daysPassed = timePassed / (1000 * 60 * 60 * 24);
                            
                            const cooldownDays = 14;
                            let cooldownText = "Available Now";
                            if (daysPassed < cooldownDays) {
                                cooldownText = `${Math.ceil(cooldownDays - daysPassed)} days left`;
                            }
                            
                            pending.push({
                                id: attempt.skillId?._id,
                                name: attempt.skillId?.title || "Unknown Skill",
                                level: attempt.level,
                                score: attempt.score,
                                date: new Date(attempt.createdAt).toLocaleDateString(),
                                cooldown: cooldownText
                            });
                        }
                    }
                    setPendingRetakes(pending);
                }
            } catch (err) {
                console.error("Failed to fetch myskill data", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 transition-colors duration-300 min-h-screen">
      
      {/* Page Header (Match Explore page style) */}
      <section className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-8 text-text-main">
          Your <span className="text-greenui">Skill Wallet</span>
        </h1>

        {/* Search Bar */}
        <div className="flex max-w-[600px] mx-auto mb-8 bg-surface rounded-lg border border-border-subtle shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-greenui transition-all duration-300">
          <div className="pl-4 flex items-center justify-center text-text-muted">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search your skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3.5 bg-transparent outline-none text-[15px] placeholder:text-text-muted text-text-main"
          />
          <button className="bg-greenbutton text-white dark:text-black px-8 font-bold text-[15px] hover:cursor-pointer hover:bg-greenbutton/90 transition-colors">
            Search
          </button>
        </div>

        {/* Filters / Tabs (Match Explore page filters) */}
        <div className="flex justify-center gap-3 md:gap-4 mb-10 flex-wrap">
          {[
            { id: "verified", label: "Active Certificates", count: skills.length },
            { id: "pending", label: "Pending Retakes", count: pendingRetakes.length },
            { id: "history", label: "Assessment History", count: null }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`hover:cursor-pointer px-5 py-2.5 rounded-full text-sm font-semibold border border-border-subtle transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-greenbutton text-white dark:text-black shadow-md dark:shadow-greenbutton/20 border-transparent"
                  : "bg-surface text-text-muted hover:border-text-muted hover:text-text-main"
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white/20 text-white dark:text-black" : "bg-canvas border border-border-subtle text-text-muted"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Content Area */}
      <div className="space-y-6">
        
        {activeTab === "verified" && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? <div className="col-span-full py-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-greenui"/></div> : skills.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((skill, idx) => (
              <Link
                href={`/profile/certificate/${skill.id}`}
                key={idx}
                className="bg-surface border-2 border-border-subtle rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-brand-secondary cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-greenui/10 text-greenui rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
                    <Award size={24} />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-text-main tracking-tight group-hover:text-brand-secondary transition-colors">{skill.score}</div>
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Score / 100</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-extrabold text-text-main text-xl mb-2">{skill.name}</h3>
                  <p className={`text-[10px] font-bold mt-0.5 uppercase ${getLevelColorClass(skill.level)} transition-colors`}>
                    {skill.level}
                  </p>
                  <p className="text-[11px] text-text-muted mt-2 leading-relaxed">{skill.statusMessage}</p>
                </div>

                <div className="mt-auto pt-4 border-t-2 border-dashed border-border-subtle flex justify-between items-center text-xs font-semibold text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-greenui" /> {skill.date}
                  </span>
                  <span className="text-[10px] bg-canvas border border-border-subtle px-2 py-1 rounded-md">
                    Valid until {skill.expires}
                  </span>
                </div>
              </Link>
            ))}
            {!isLoading && skills.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-border-subtle rounded-3xl bg-surface">
                <Award size={48} className="mx-auto text-border-subtle mb-4" />
                <h3 className="text-xl font-bold text-text-main mb-2">No active certificates.</h3>
                <p className="text-text-muted">Pass an assessment to earn your first certificate.</p>
              </div>
            )}
            </div>

            {!isLoading && expiredSkills.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-accent-orange" />
                  Expired Certificates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {expiredSkills.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((skill, idx) => (
                    <Link
                      href={`/skill/${skill.id}${skill.isInGracePeriod && skill.graceLevel ? `?level=${skill.graceLevel}` : "?level=beginner"}`}
                      key={`expired-${idx}`}
                      className={`bg-surface border-2 rounded-2xl p-6 shadow-sm flex flex-col transition-all duration-300 cursor-pointer ${
                        skill.isInGracePeriod ? "border-accent-orange/30 hover:border-accent-orange/60" : "border-red-500/30 hover:border-red-500/50"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                        skill.isInGracePeriod ? "bg-accent-orange/10 text-accent-orange" : "bg-red-500/10 text-red-500"
                      }`}>
                        <Clock size={24} />
                      </div>
                      <h3 className="font-extrabold text-text-main text-xl mb-2">{skill.name}</h3>
                      <p className={`text-[11px] font-semibold leading-relaxed ${
                        skill.isInGracePeriod ? "text-accent-orange" : "text-red-500"
                      }`}>{skill.statusMessage}</p>
                      <p className="text-[11px] text-text-muted mt-3">
                        {skill.isInGracePeriod
                          ? `Renew ${skill.graceLevel} without re-climbing`
                          : "Restart from Beginner"}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- PENDING RETAKES --- */}
        {activeTab === "pending" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
            {isLoading ? <div className="col-span-full py-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-greenui"/></div> : pendingRetakes.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((attempt, idx) => (
              <Link
                href={`/skill/${attempt.id}`}
                key={idx} 
                className="bg-surface border-2 border-border-subtle rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-accent-orange cursor-pointer group"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent-orange transition-colors group-hover:bg-accent-orange/80"></div>
                
                <div className="flex justify-between items-start mb-4 ml-2">
                  <div className="w-12 h-12 bg-accent-orange/10 text-accent-orange rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
                    <AlertTriangle size={24} />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-red-500 tracking-tight transition-colors">{attempt.score}</div>
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Score / 100</div>
                  </div>
                </div>

                <div className="mb-6 ml-2">
                  <h3 className="font-extrabold text-text-main text-xl mb-2">{attempt.name}</h3>
                  <p className={`text-[10px] font-bold mt-0.5 uppercase ${getLevelColorClass(attempt.level)}`}>
                    {attempt.level}
                  </p>
                </div>
                
                <div className="mt-auto pt-4 border-t-2 border-dashed border-border-subtle flex justify-between items-center text-xs font-semibold text-text-muted ml-2">
                  <span className="font-medium text-text-muted text-[10px]">
                    Failed on <strong className="text-text-main">{attempt.date}</strong>
                  </span>
                  {attempt.cooldown === "Available Now" ? (
                    <span className="px-2.5 py-1 rounded-md font-bold text-[10px] bg-greenui/15 text-greenui flex items-center gap-1.5 shadow-sm">
                      <CheckCircle size={12} /> Available
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md font-bold text-[10px] bg-accent-orange/15 text-accent-orange flex items-center gap-1.5 shadow-sm">
                      <Clock size={12} /> Opens: {attempt.cooldown}
                    </span>
                  )}
                </div>
              </Link>
            ))}
            {!isLoading && pendingRetakes.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-border-subtle rounded-3xl bg-surface">
                <CheckCircle size={48} className="mx-auto text-greenui mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-text-main mb-2">You're all clear!</h3>
                <p className="text-text-muted">No pending retakes at the moment.</p>
              </div>
            )}
          </div>
        )}

        {/* --- ASSESSMENT HISTORY --- */}
        {activeTab === "history" && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
            {isLoading ? <div className="py-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-greenui"/></div> : history.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((attempt, idx) => (
              <div key={idx} className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden transition-all duration-300">
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${attempt.status === "PASSED" ? "bg-greenui" : "bg-red-500"}`}></div>
                
                <div className="flex-1 ml-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-text-main">{attempt.name}</h3>
                      <p className={`text-[10px] font-bold mt-0.5 uppercase ${getLevelColorClass(attempt.level)}`}>
                        {attempt.level}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xl font-bold ${attempt.status === "PASSED" ? "text-greenui" : "text-red-500"}`}>{attempt.score}</span>
                      <span className="text-xs text-text-muted ml-1">/100</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 text-[10px] text-text-muted">
                    <span className="flex items-center gap-1 font-medium">
                      Date: {attempt.date}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${attempt.status === "PASSED" ? "bg-greenui/15 text-greenui" : "bg-red-500/15 text-red-500"}`}>
                      {attempt.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {!isLoading && history.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-border-subtle rounded-3xl bg-surface">
                <History size={48} className="mx-auto text-border-subtle mb-4" />
                <h3 className="text-xl font-bold text-text-main mb-2">No history found.</h3>
                <p className="text-text-muted">Take an assessment to see your log here.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
