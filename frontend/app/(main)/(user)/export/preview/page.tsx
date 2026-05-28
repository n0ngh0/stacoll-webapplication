"use client";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Download, Loader2 } from "lucide-react";
import { useExportContext } from "@/components/providers/export-context";
import { ResumeTemplate } from "@/components/resume/resume-template";
import { generateResumePDF } from "@/lib/generate-pdf";

// Mock Data (Should match the one in profile/page.tsx)
const mockUser = {
  name: "Winny Pooh",
  role: "AI / Developer",
  email: "niggadamdam911@gmail.com",
  bio: "Interested in AI, software development, and building efficient systems. Passionate about learning new technologies and applying them to real-world projects.",
};

const allSkills = [
  { name: "React.js", level: "INTERMEDIATE", score: 82, date: "Oct 12, 2025" },
  { name: "Node.js", level: "BEGINNER", score: 67, date: "Oct 12, 2025" },
  { name: "Python", level: "ADVANCED", score: 95, date: "Sep 28, 2025" },
  { name: "JavaScript", level: "ADVANCED", score: 91, date: "Jan 15, 2026" },
  { name: "SQL", level: "INTERMEDIATE", score: 85, date: "Nov 05, 2025" },
];

const allProjects = [
  {
    title: "Neural Analytics Engine",
    description: "Machine learning pipeline for processing real-time developer telemetry to predict career paths based on coding patterns.",
    tags: ["REACT", "SOLIDITY", "NODE.JS", "WEB3.JS"],
  },
  {
    title: "Stacoll Verified Identity",
    description: "A decentralized identity verification platform using ZK-proofs for academic and skill credentials. Built to scale with millions of users.",
    tags: ["HTML", "PYTHON", "NODE.JS"],
  }
];

export default function ExportPreviewPage() {
  const router = useRouter();
  const { selectedSkills, selectedProjects } = useExportContext();
  const resumeRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Redirect if they accessed this directly without selecting anything
    if (selectedSkills.size === 0 && selectedProjects.size === 0) {
      router.push("/export");
    }
  }, [selectedSkills, selectedProjects, router]);

  // Filter based on selection
  const skillsToRender = allSkills.filter((_, idx) => selectedSkills.has(idx));
  const projectsToRender = allProjects.filter((_, idx) => selectedProjects.has(idx));

  const handleDownload = async () => {
    if (!resumeRef.current) return;
    try {
      setIsGenerating(true);
      await generateResumePDF(resumeRef.current, `${mockUser.name.replace(/\s+/g, '_')}_Resume.pdf`);
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
              user={mockUser}
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
