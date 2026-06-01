"use client";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Download, Loader2 } from "lucide-react";
import { useExportContext } from "@/components/providers/export-context";
import { ResumeTemplate } from "@/components/resume/resume-template";
import { generateResumePDF } from "@/lib/generate-pdf";

export default function ExportPreviewPage() {
  const router = useRouter();
  const { selectedSkills, selectedProjects, userData } = useExportContext();
  const resumeRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Redirect if they accessed this directly without selecting anything or without user data
    if (!userData || (selectedSkills.size === 0 && selectedProjects.size === 0)) {
      router.push("/export");
    }
  }, [selectedSkills, selectedProjects, userData, router]);

  if (!mounted || !userData || (selectedSkills.size === 0 && selectedProjects.size === 0)) {
    return <div className="min-h-screen bg-canvas flex items-center justify-center"><Loader2 className="animate-spin text-greenui" size={32} /></div>;
  }

  const allSkills = userData.verifiedSkills || [];
  const allProjects = userData.projects || [];

  // Filter based on selection
  const skillsToRender = allSkills.filter((_: any, idx: number) => selectedSkills.has(idx)).map((s: any) => ({
    name: s.skillName || s.name,
    level: s.level,
    score: s.score,
    date: s.verifiedAt ? new Date(s.verifiedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : ""
  }));
  const projectsToRender = allProjects.filter((_: any, idx: number) => selectedProjects.has(idx));

  // Transform userData to match template interface
  const userForTemplate = {
    name: userData.username || "",
    role: userData.title || "",
    email: userData.email || "", // Assuming email might be available
    bio: userData.bio || "",
  };

  const handleDownload = async () => {
    if (!resumeRef.current) return;
    try {
      setIsGenerating(true);
      await generateResumePDF(resumeRef.current, `${userForTemplate.name.replace(/\s+/g, '_')}_Resume.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!mounted || (selectedSkills.size === 0 && selectedProjects.size === 0)) {
    return <div className="min-h-screen bg-canvas flex items-center justify-center"><Loader2 className="animate-spin text-greenui" size={32} /></div>;
  }

  // Current Date logic
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const issuedDateStr = today.toLocaleDateString('en-US', options);

  // Generate random verification ID based on time
  const verificationId = `STC-${Math.floor(Date.now() / 1000).toString(16).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-surface-hover transition-colors duration-300 pb-32">
      {/* Top Bar */}
      <div className="bg-canvas border-b border-border-subtle sticky top-[72px] z-30 transition-colors shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/export" className="flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-text-main transition-colors cursor-pointer">
            <ChevronLeft size={18} /> Back to Edit
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-muted font-medium hidden sm:block">A4 Size • Print Ready</span>
            <button 
              onClick={handleDownload}
              disabled={isGenerating}
              className="bg-brand-secondary hover:brightness-110 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              {isGenerating ? "Generating..." : "Download PDF"}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="max-w-6xl mx-auto px-4 py-12 flex justify-center overflow-x-auto">
        <div className="shadow-2xl rounded-sm overflow-hidden flex-shrink-0 bg-white">
            <ResumeTemplate 
              ref={resumeRef}
              user={userForTemplate}
              skills={skillsToRender}
              projects={projectsToRender}
              issuedDate={issuedDateStr}
              verificationId={verificationId}
            />
        </div>
      </div>
    </div>
  );
}
