"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Award, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { CATEGORY_THEMES, getLevelColorClass } from "@/types/question";

// Mock data
const mockSkills = [
  { name: "React.js", category: "programming", level: "INTERMEDIATE", score: 82, date: "Oct 12, 2025", expires: "Oct 12, 2027", fullDescription: "### Competencies\n\n- Build reusable and performant components\n- Manage complex state using Context and Hooks\n- Integrate effectively with REST APIs" },
  { name: "Node.js", category: "programming", level: "BEGINNER", score: 67, date: "Oct 12, 2025", expires: "Oct 12, 2027", fullDescription: "### Competencies\n\n- Create basic HTTP servers\n- Understand CommonJS modules\n- Work with the file system and basic streams" },
  { name: "Python", category: "programming", level: "ADVANCED", score: 95, date: "Sep 28, 2025", expires: "Sep 28, 2027", fullDescription: "### Competencies\n\n- Optimize application performance and memory usage\n- Implement advanced decorators, generators, and context managers\n- Design scalable and maintainable application architectures" },
  { name: "JavaScript", category: "programming", level: "ADVANCED", score: 91, date: "Jan 15, 2026", expires: "Jan 15, 2028", fullDescription: "### Competencies\n\n- Master asynchronous programming (Promises/async-await)\n- Deep understanding of closures, scopes, and prototypes\n- Write efficient, modern ES6+ code patterns" },
  { name: "SQL", category: "analyst", level: "INTERMEDIATE", score: 85, date: "Nov 05, 2025", expires: "Nov 05, 2027", fullDescription: "### Competencies\n\n- Write complex queries using subqueries\n- Perform data aggregations with GROUP BY and HAVING\n- Use multiple JOIN types effectively and efficiently" },
];

export default function CertificatePage() {
  const params = useParams();
  const router = useRouter();
  const rawSkillId = (params?.skill || "") as string;
  const decodedSkill = decodeURIComponent(rawSkillId).toLowerCase();

  const [mounted, setMounted] = useState(false);
  const [skillData, setSkillData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    window.scrollTo(0, 0);
    fetchData();
  }, [decodedSkill]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      
      // Fetch user profile to get verified skills
      const profileRes = await fetch(`${apiUrl}/profile/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      
      if (profileData.success && profileData.user?.verifiedSkills) {
        // Find the skill by ID (since URL param is the skill ID)
        const vSkill = profileData.user.verifiedSkills.find((s: any) => s.skillId === rawSkillId);
        
        if (vSkill) {
          setSkillData({
            name: vSkill.skillName,
            category: "programming", // Default or we could fetch skill details
            level: vSkill.level.toUpperCase(),
            score: vSkill.score,
            date: new Date(vSkill.verifiedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            expires: new Date(new Date(vSkill.verifiedAt).getTime() + 2 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            fullDescription: "### Competencies\n\n- Demonstrated foundational knowledge\n- Successfully completed all required assessments\n- Met all the criteria for this skill level"
          });
          return;
        }
      }

      // Fallback logic for mock data or if not found in verifiedSkills
      let found = mockSkills.find(s => s.name.toLowerCase() === decodedSkill);
      if (!found) {
        found = {
          name: decodeURIComponent(rawSkillId).split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          category: "programming",
          level: "VERIFIED",
          score: 100,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          expires: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          fullDescription: "### Competencies\n\n- Demonstrated foundational knowledge\n- Successfully completed all required assessments\n- Met all the criteria for this skill level"
        };
      }
      setSkillData(found);
    } catch (err) {
      console.error(err);
    }
  };

  if (!mounted) {
    return <div className="fixed inset-0 z-[9999] bg-canvas animate-pulse transition-colors duration-300"></div>;
  }

  if (!skillData) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-canvas transition-colors duration-300">
        <h2 className="text-2xl font-bold text-text-main mb-3">Certificate Not Found</h2>
        <button onClick={() => router.back()} className="text-brand-secondary hover:underline font-bold cursor-pointer">Back to Profile</button>
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
        
        {/* Header Navigation */}
        <div className="px-8 py-4 border-b border-border-subtle transition-colors duration-300">
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center text-text-muted hover:text-text-main transition-colors text-sm font-semibold gap-1 cursor-pointer"
          >
            <ChevronLeft size={18} />
            Back to Profile
          </button>
        </div>

        {/* Certificate Title */}
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
          {/* Main Info */}
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

          {/* Competencies Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-main transition-colors duration-300">Competencies Demonstrated</h2>
            <div className="bg-canvas p-6 md:p-8 rounded-2xl border border-border-subtle transition-colors duration-300 prose prose-sm md:prose-base dark:prose-invert max-w-none text-text-main">
              <ReactMarkdown>
                {skillData.fullDescription || "*No detailed criteria available.*"}
              </ReactMarkdown>
            </div>
          </div>

          {/* Next Level Action */}
          <div className="pt-8 border-t border-border-subtle transition-colors duration-300 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-text-main transition-colors">Ready for the next challenge?</h3>
              <p className="text-sm text-text-muted mt-1 transition-colors">Take the assessment for the next level to upgrade your rank.</p>
            </div>
            
            <button 
              onClick={() => router.push(`/skill/skill-${skillData.name.toLowerCase().replace('.js', '')}`)}
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
