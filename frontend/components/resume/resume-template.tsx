import React from "react";
import { getLevelColorClass, getLevelBgColorClass } from "@/types/question";

interface Skill {
  name: string;
  level: string;
  score: number;
  date: string;
}

interface Project {
  title: string;
  description: string;
  tags: string[];
}

interface ResumeTemplateProps {
  user: {
    name: string;
    email: string;
    role: string;
    bio: string;
  };
  skills: Skill[];
  projects: Project[];
  issuedDate: string;
  verificationId: string;
}

export const ResumeTemplate = React.forwardRef<HTMLDivElement, ResumeTemplateProps>(
  ({ user, skills, projects, issuedDate, verificationId }, ref) => {


    return (
      <div
        ref={ref}
        className="w-[794px] min-h-[1123px] bg-white px-12 py-14 text-slate-800 font-sans mx-auto shadow-md"
        style={{ fontFamily: "'Figtree', sans-serif", boxSizing: "border-box" }}
      >
        {/* Header Section */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-4 mb-8">
          <div className="flex items-center gap-2">
            <img src="/assets/LogoStacoll.png" alt="Stacoll" className="w-10 h-10 object-contain" />
            <div className="leading-tight">
              <h1 className="text-xl font-extrabold text-[#10DFAE] tracking-tight">STACOLL</h1>
              <p className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Official Verified Skill Report</p>
            </div>
          </div>
          <div className="text-right text-[10px] text-gray-500 font-medium">
            <div className="flex gap-4">
              <div>
                <p className="text-gray-400 uppercase tracking-wider mb-0.5 text-[8px]">Issued</p>
                <p className="text-gray-800 font-semibold">{issuedDate}</p>
              </div>
              <div>
                <p className="text-gray-400 uppercase tracking-wider mb-0.5 text-[8px]">Verification ID</p>
                <p className="text-gray-800 font-semibold">{verificationId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Info Section */}
        <div className="mb-10 text-right">
            <p className="text-xs text-gray-600 mb-6 flex items-center justify-end gap-1.5 font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                {user.email}
            </p>
            <div className="text-left">
                <h2 className="text-4xl font-bold text-gray-900 mb-2">{user.name}</h2>
                <h3 className="text-xl font-semibold text-[#00a3e0] mb-3">{user.role}</h3>
                <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">{user.bio}</p>
            </div>
        </div>

        {/* Skills Section */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-6">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Verified Core Competencies</h4>
              <div className="h-px bg-gray-200 w-full flex-grow"></div>
          </div>
          
          {skills.length > 0 ? (
            <div className="w-full">
              <div className="grid grid-cols-12 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">
                <div className="col-span-5">Skill</div>
                <div className="col-span-3">Proficiency</div>
                <div className="col-span-2 text-right">Verification Score</div>
                <div className="col-span-2 text-right">Date Verified</div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {skills.map((skill, idx) => (
                  <div key={idx} className="grid grid-cols-12 items-center py-4 px-2">
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-gray-50 flex items-center justify-center text-[#00a3e0] border border-gray-100">
                         <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                      </div>
                      <span className="font-bold text-gray-900 text-[15px]">{skill.name}</span>
                    </div>
                    <div className="col-span-3">
                      <span className={`text-[9px] font-bold px-2 py-1 rounded-full uppercase ${getLevelColorClass(skill.level)} ${getLevelBgColorClass(skill.level)}`}>
                        {skill.level}
                      </span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-lg font-bold text-gray-800">{skill.score}</span>
                      <span className="text-xs text-gray-400">/100</span>
                    </div>
                    <div className="col-span-2 text-right text-xs font-medium text-gray-500">
                      {skill.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No skills selected.</p>
          )}
        </div>

        {/* Projects Section */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-6">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Verified Project Evidence</h4>
              <div className="h-px bg-gray-200 w-full flex-grow"></div>
          </div>
          
          {projects.length > 0 ? (
            <div className="grid grid-cols-2 gap-6">
              {projects.map((project, idx) => (
                <div key={idx} className="bg-gray-50 border-l-4 border-[#10DFAE] p-5 rounded-r-xl">
                  <h5 className="font-bold text-gray-900 text-[15px] mb-2">{project.title}</h5>
                  <p className="text-[11px] text-gray-600 leading-relaxed mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {project.tags.map(tag => (
                      <span key={tag} className="text-[8px] font-bold bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No projects selected.</p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-xs text-gray-400 font-medium">
          Generated by Stacoll
        </div>
      </div>
    );
  }
);
ResumeTemplate.displayName = "ResumeTemplate";
