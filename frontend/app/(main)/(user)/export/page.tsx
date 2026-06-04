"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Check, AlertCircle, Loader2 } from "lucide-react";
import { useExportContext } from "@/components/providers/export-context";
import { getLevelColorClass, getLevelBgColorClass } from "@/types/question";
import { apiFetch } from "@/lib/api/client";
import { getToken } from "@/lib/auth-session";

export default function ExportPreparePage() {
  const router = useRouter();
  const { selectedSkills, selectedProjects, setSelectedSkills, setSelectedProjects, userData, setUserData } = useExportContext();
  const [isLoading, setIsLoading] = useState(!userData);
  const [error, setError] = useState("");
  
  // Initialize on first mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userData) {
          if (!getToken()) {
            router.push("/signin");
            return;
          }
          const res = await apiFetch("/profile/me");
          const data = await res.json();
          if (data.success) {
            const user = data.user;
            
            // Helper to get highest skills
            const getLevelWeight = (level: string) => {
              if (!level) return 0;
              switch (level.toUpperCase()) {
                case 'BEGINNER': return 1;
                case 'INTERMEDIATE': return 2;
                case 'ADVANCED': return 3;
                default: return 0;
              }
            };
            
            if (user.verifiedSkills) {
              const skillMap = new Map();
              user.verifiedSkills.forEach((skill: any) => {
                const name = skill.skillName || skill.name;
                if (!skillMap.has(name)) {
                  skillMap.set(name, skill);
                } else {
                  const currentSkill = skillMap.get(name);
                  if (getLevelWeight(skill.level) > getLevelWeight(currentSkill.level)) {
                    skillMap.set(name, skill);
                  } else if (getLevelWeight(skill.level) === getLevelWeight(currentSkill.level) && skill.score > currentSkill.score) {
                    skillMap.set(name, skill);
                  }
                }
              });
              user.verifiedSkills = Array.from(skillMap.values());
            }

            setUserData(user);
            // Select all by default
            if (selectedSkills.size === 0 && selectedProjects.size === 0) {
              setSelectedSkills(new Set((user.verifiedSkills || []).map((_: any, i: number) => i)));
              setSelectedProjects(new Set((user.projects || []).map((_: any, i: number) => i)));
            }
          } else {
            setError(data.message || "Failed to load profile");
          }
        }
      } catch (err) {
        setError("Error connecting to server");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [userData, selectedSkills.size, selectedProjects.size, router, setSelectedProjects, setSelectedSkills, setUserData]);

  const allSkills = userData?.verifiedSkills || [];
  const allProjects = userData?.projects || [];

  const toggleSkill = (index: number) => {
    const newSet = new Set(selectedSkills);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    setSelectedSkills(newSet);
  };

  const toggleProject = (index: number) => {
    const newSet = new Set(selectedProjects);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    setSelectedProjects(newSet);
  };

  const selectAllSkills = (select: boolean) => {
    setSelectedSkills(select ? new Set(allSkills.map((_: any, i: number) => i)) : new Set());
  };

  const selectAllProjects = (select: boolean) => {
    setSelectedProjects(select ? new Set(allProjects.map((_: any, i: number) => i)) : new Set());
  };

  const canPreview = selectedSkills.size > 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-greenui" />
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="text-center py-20 flex flex-col items-center justify-center">
        <p className="text-text-muted mb-4">{error || "Failed to load data"}</p>
        <button onClick={() => router.push("/profile")} className="px-6 py-2 bg-surface border border-border-subtle font-bold rounded-xl hover:bg-surface-hover transition-all">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 transition-colors duration-300 pb-32">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link href="/profile" className="p-2 bg-surface hover:bg-surface-hover rounded-full transition-colors border border-border-subtle cursor-pointer">
          <ChevronLeft size={20} className="text-text-main" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-text-main">Prepare Your Resume</h1>
          <p className="text-text-muted mt-1">Select the skills and projects you want to feature.</p>
        </div>
      </div>

      {/* User Info Preview */}
      <section className="bg-bg-brand-subtle dark:bg-bg-brand-subtle/10 border border-border-subtle rounded-2xl p-6 mb-10 flex flex-col md:flex-row gap-6 items-center md:items-start transition-colors">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-text-main">{userData.username}</h2>
          <p className="font-semibold text-brand-secondary mt-1">{userData.title || "No Title Set"}</p>
          <p className="text-text-muted text-sm mt-3 leading-relaxed">{userData.bio || "No bio available."}</p>
        </div>
        <div className="text-xs text-text-muted bg-canvas px-3 py-1.5 rounded-md border border-border-subtle shrink-0">
          * Editable in Profile settings
        </div>
      </section>

      {/* Skills Section */}
      <section className="mb-10">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-xl font-bold text-text-main">Verified Skills</h2>
            <p className="text-sm text-text-muted mt-1">{selectedSkills.size} of {allSkills.length} selected</p>
          </div>
          <button 
            onClick={() => selectAllSkills(selectedSkills.size !== allSkills.length)}
            className="text-sm font-semibold text-brand-secondary hover:underline cursor-pointer"
          >
            {selectedSkills.size === allSkills.length ? "Deselect All" : "Select All"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allSkills.map((skill: any, idx: number) => {
            const isSelected = selectedSkills.has(idx);
            return (
              <div 
                key={idx}
                onClick={() => toggleSkill(idx)}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between ${
                  isSelected ? "border-greenui bg-greenui/5 shadow-sm" : "border-border-subtle bg-surface hover:border-gray-300"
                }`}
              >
                <div>
                  <h3 className="font-bold text-text-main mb-1">{skill.skillName || skill.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${getLevelColorClass(skill.level)} ${getLevelBgColorClass(skill.level)}`}>
                      {skill.level}
                    </span>
                    <span className="text-xs text-text-muted">{skill.score}/100</span>
                  </div>
                </div>
                
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isSelected ? "bg-greenui border-greenui text-white" : "border-border-subtle bg-canvas"
                }`}>
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Projects Section */}
      <section className="mb-10">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-xl font-bold text-text-main">Recent Projects</h2>
            <p className="text-sm text-text-muted mt-1">{selectedProjects.size} of {allProjects.length} selected</p>
          </div>
          <button 
            onClick={() => selectAllProjects(selectedProjects.size !== allProjects.length)}
            className="text-sm font-semibold text-brand-secondary hover:underline cursor-pointer"
          >
            {selectedProjects.size === allProjects.length ? "Deselect All" : "Select All"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {allProjects.map((project, idx) => {
            const isSelected = selectedProjects.has(idx);
            return (
              <div 
                key={idx}
                onClick={() => toggleProject(idx)}
                className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-start gap-4 ${
                  isSelected ? "border-brand-secondary bg-brand-secondary/5 shadow-sm" : "border-border-subtle bg-surface hover:border-gray-300"
                }`}
              >
                <div className={`w-6 h-6 shrink-0 mt-0.5 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isSelected ? "bg-brand-secondary border-brand-secondary text-white" : "border-border-subtle bg-canvas"
                }`}>
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-text-main text-lg mb-1">{project.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed mb-3">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <span key={tag} className="text-[10px] bg-canvas border border-border-subtle px-2 py-1 rounded font-bold text-text-muted">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Action Bar (Sticky) */}
      <div className="fixed bottom-0 left-0 right-0 bg-canvas/90 backdrop-blur-md border-t border-border-subtle p-4 z-40 transition-colors">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            {!canPreview && (
              <span className="flex items-center gap-1.5 text-accent-orange font-medium">
                <AlertCircle size={16} /> Please select at least 1 skill
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/profile")} className="px-6 py-2.5 rounded-xl font-bold text-text-main bg-surface border border-border-subtle hover:bg-surface-hover transition-colors cursor-pointer">
              Cancel
            </button>
            <button 
              onClick={() => canPreview && router.push("/export/preview")}
              disabled={!canPreview}
              className={`px-8 py-2.5 rounded-xl font-bold text-white shadow-sm transition-all flex items-center gap-2 ${
                canPreview 
                ? "bg-greenui hover:brightness-105 cursor-pointer shadow-greenui/20" 
                : "bg-gray-400 cursor-not-allowed opacity-70"
              }`}
            >
              Preview Resume
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
