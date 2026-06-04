"use client";
import { ExternalLink, Edit3, Award, CheckCircle, X, Plus, Trash2, Loader2, Save, Clock } from "lucide-react";
import Link from "next/link";
import { getLevelColorClass } from "@/types/question";
import { useState, useEffect } from "react";
import { User } from "@/types/user";
import { apiFetch } from "@/lib/api/client";
import { clearSession, getToken, updateStoredUser } from "@/lib/auth-session";

const JOB_ROLES = [
  { title: "Front-end Developer", skills: ["React.js", "HTML", "CSS", "TypeScript", "Next.js", "Tailwind CSS"] },
  { title: "Back-end Developer", skills: ["Node.js", "Express", "MongoDB", "SQL", "Python", "Docker"] },
  { title: "Full Stack Developer", skills: ["React.js", "Node.js", "MongoDB", "TypeScript", "Next.js"] },
  { title: "Data Analyst", skills: ["Python", "SQL", "Excel", "Tableau", "Power BI"] },
  { title: "DevOps Engineer", skills: ["Docker", "Kubernetes", "AWS", "Linux", "CI/CD"] },
  { title: "Mobile Developer", skills: ["React Native", "Swift", "Kotlin", "Flutter"] },
  { title: "UI/UX Designer", skills: ["Figma", "Adobe XD", "UI Design", "UX Research"] },
  { title: "Data Scientist", skills: ["Python", "Machine Learning", "SQL", "R", "Pandas"] },
  { title: "Cloud Engineer", skills: ["AWS", "Azure", "GCP", "Linux", "Terraform"] },
  { title: "Cybersecurity Analyst", skills: ["Linux", "Network Security", "Python", "Ethical Hacking"] },
  { title: "Game Developer", skills: ["C#", "C++", "Unity", "Unreal Engine"] },
];

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "projects">("profile");

  // Edit form state
  const [editForm, setEditForm] = useState<{
    username: string;
    title: string;
    bio: string;
    imgUrl: string;
    projects: { title: string; description: string; tags: string[] }[];
  }>({
    username: "",
    title: "",
    bio: "",
    imgUrl: "",
    projects: []
  });

  // Helper: format date from ISO string
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (!getToken()) return;

      const res = await apiFetch("/profile/me");

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${text.substring(0, 50)}...`);
      }

      if (data.success) {
        const user = data.user;
        
        // Filter to keep only the highest level of each skill
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

        setUser(user);
        setEditForm({
          username: data.user.username || "",
          title: data.user.title || "",
          bio: data.user.bio || "",
          imgUrl: data.user.imgUrl || "",
          projects: data.user.projects || []
        });
      } else {
        if (res.status === 401) {
          clearSession();
        }
        console.error("Profile fetch failed:", data.message);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Validate projects
      for (let i = 0; i < editForm.projects.length; i++) {
        const p = editForm.projects[i];
        if (!p.title.trim()) {
          setActiveTab("projects");
          setErrorMsg(`Project #${i + 1} is missing a title.`);
          return;
        }
        if (!p.tags || p.tags.length === 0) {
          setActiveTab("projects");
          setErrorMsg(`Project "${p.title}" must have at least one tag.`);
          return;
        }
      }

      setErrorMsg("");
      setIsSaving(true);
      const res = await apiFetch("/profile/me", {
        method: "PUT",
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (data.success) {
        setUser(data.user); // Update local state with saved data
        setIsEditModalOpen(false);
        // Also update local storage user if needed for navbar
        updateStoredUser({ username: data.user.username });
      } else {
        setErrorMsg(data.message || "Failed to save profile");
      }
    } catch (error: any) {
      console.error("Error saving profile:", error);
      setErrorMsg(error.message || "Error saving profile");
    } finally {
      setIsSaving(false);
    }
  };

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image must be smaller than 5MB.');
      return;
    }

    setIsUploadingImage(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'stacoll/profiles');

      const res = await fetch(`${apiUrl}/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setEditForm((prev) => ({ ...prev, imgUrl: data.url }));
      } else {
        setErrorMsg(data.message || 'Failed to upload image.');
      }
    } catch {
      setErrorMsg('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddProject = () => {
    setEditForm({
      ...editForm,
      projects: [...editForm.projects, { title: "", description: "", tags: [] }]
    });
  };

  const handleUpdateProject = (index: number, field: string, value: any) => {
    const updatedProjects = [...editForm.projects];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    setEditForm({ ...editForm, projects: updatedProjects });
  };

  const handleRemoveProject = (index: number) => {
    const updatedProjects = [...editForm.projects];
    updatedProjects.splice(index, 1);
    setEditForm({ ...editForm, projects: updatedProjects });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-greenui" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 flex flex-col items-center justify-center">
        <p className="text-text-muted mb-4">Failed to load profile or your session has expired.</p>
        <Link href="/signin" className="px-6 py-2 bg-greenui text-white font-bold rounded-xl hover:brightness-105 transition-all shadow-sm">
          Please Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 transition-colors duration-300 relative">

      {/* --- USER SECTION --- */}
      <section className="bg-bg-brand-subtle dark:bg-bg-brand-subtle/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 relative mb-12 transition-colors duration-300">
        <div className="relative">
          <div className="w-40 h-40 rounded-full border-4 border-greenui overflow-hidden shadow-lg">
            <img src={user.imgUrl || "/profiles/default.jpg"} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <button
            onClick={() => { setErrorMsg(""); setActiveTab("profile"); setIsEditModalOpen(true); }}
            className="absolute bottom-1 right-1 bg-greenui p-2 rounded-lg text-white shadow-md hover:brightness-110 transition cursor-pointer"
          >
            <Edit3 size={20} />
          </button>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-text-main transition-colors">{user.username}</h1>
              <p className="text-xl font-medium text-text-muted dark:text-greenui mt-1 transition-colors">
                {user.title || "No Title Set"}
              </p>
            </div>
            <Link href="/export" className="bg-brand-secondary text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 self-center md:self-start hover:bg-brand-secondary-hover shadow-sm transition cursor-pointer">
              <ExternalLink size={18} /> Export
            </Link>
          </div>
          <p className="text-text-muted mt-4 max-w-2xl leading-relaxed transition-colors">
            {user.bio || "Write something about yourself..."}
          </p>
        </div>
      </section>

      {/* --- RECOMMEND SECTION --- */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-main transition-colors">Job Recommendations</h2>
        </div>
        
        {(() => {
          // Calculate match for each job based on user's verified skills
          const userSkillNames = user.verifiedSkills?.map((s: any) => s.skillName.toLowerCase()) || [];
          
          const rankedJobs = JOB_ROLES.map(job => {
            const matchedSkills = job.skills.filter(s => userSkillNames.includes(s.toLowerCase()));
            const matchCount = matchedSkills.length;
            const matchPercentage = Math.round((matchCount / job.skills.length) * 100);
            return {
              ...job,
              matchCount,
              matchPercentage
            };
          }).sort((a, b) => b.matchPercentage - a.matchPercentage); // Sort descending

          return (
            <div className="flex overflow-x-auto gap-6 snap-x pb-6 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border-subtle hover:[&::-webkit-scrollbar-thumb]:bg-text-muted [&::-webkit-scrollbar-thumb]:rounded-full">
              {rankedJobs.map((job, idx) => (
                <div key={idx} className="min-w-[300px] md:min-w-[340px] snap-start bg-surface border-2 border-border-subtle rounded-2xl p-6 flex flex-col shadow-sm transition-colors duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-text-main transition-colors">{job.title}</h3>
                    <div className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                      job.matchPercentage >= 70 ? 'bg-greenui/10 text-greenui border border-greenui/20' : 
                      job.matchPercentage >= 40 ? 'bg-accent-orange/10 text-accent-orange border border-accent-orange/20' : 
                      'bg-canvas border border-border-subtle text-text-muted'
                    }`}>
                      {job.matchPercentage}% Match
                    </div>
                  </div>
                  
                  <div className="flex-1 mt-2">
                    <p className="text-[10px] font-bold text-text-muted mb-3 uppercase tracking-wider">Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map(skill => {
                        const hasSkill = userSkillNames.includes(skill.toLowerCase());
                        return (
                          <span 
                            key={skill} 
                            className={`text-[11px] px-2.5 py-1 rounded-md font-bold transition-colors flex items-center gap-1.5 ${
                              hasSkill 
                                ? 'bg-greenui/10 border border-greenui/30 text-greenui' 
                                : 'bg-canvas border border-border-subtle text-text-muted opacity-75'
                            }`}
                          >
                            {hasSkill && <CheckCircle size={12} strokeWidth={3} />}
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* --- RECENT PROJECTS --- */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-text-main transition-colors">Recent Projects</h2>
            <button
              onClick={() => { setErrorMsg(""); setActiveTab("projects"); setIsEditModalOpen(true); }}
              className="text-sm font-semibold text-brand-secondary hover:underline cursor-pointer"
            >
              Edit Projects
            </button>
          </div>

          <div className="space-y-6">
            {!user.projects || user.projects.length === 0 ? (
              <div className="bg-surface border border-border-subtle rounded-2xl p-8 text-center transition-colors duration-300">
                <p className="text-text-muted font-medium">
                  No projects have been added yet. Click &quot;Edit Projects&quot; to get started.
                </p>
              </div>
            ) : (
              user.projects.map((project, idx) => (
                <div key={idx} className="bg-surface border-2 border-brand-secondary dark:border-brand-secondary/70 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="text-xl font-bold text-text-main transition-colors">{project.title}</h3>
                  <p className="text-sm text-text-muted mt-3 leading-relaxed transition-colors whitespace-pre-wrap">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {project.tags?.map((tag) => (
                      <span key={tag} className="text-[10px] bg-canvas border border-border-subtle px-2 py-1 rounded font-bold text-text-muted transition-colors uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-text-main mb-6 transition-colors">Verified Skills</h2>
          <div className="space-y-4">
            {!user.verifiedSkills || user.verifiedSkills.length === 0 ? (
              <div className="bg-surface border border-border-subtle rounded-2xl p-8 text-center transition-colors duration-300">
                <p className="text-text-muted font-medium">
                  No verified skills yet. Start an assessment to earn your first badge!
                </p>
              </div>
            ) : (
              user.verifiedSkills.map((skill, idx) => (
                <div key={idx} className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden transition-colors duration-300">
                  
                  {/* แถบสีด้านซ้าย */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${idx % 2 === 0 ? "bg-greenui" : "bg-accent-orange"}`}></div>
                  
                  <div className="bg-canvas p-3 rounded-xl transition-colors">
                    <Award className={idx % 2 === 0 ? "text-greenui" : "text-accent-orange"} size={24} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-text-main transition-colors">{skill.skillName}</h3>
                        <p className={`text-[10px] font-bold mt-0.5 ${getLevelColorClass(skill.level.toUpperCase())} transition-colors`}>
                          {skill.level.toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-text-main transition-colors">{skill.score}</span>
                        <span className="text-xs text-text-muted ml-1 transition-colors">/100</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 text-[10px] text-text-muted transition-colors">
                      <span className="flex items-center gap-1">
                        <CheckCircle size={12} className="text-text-muted opacity-70" /> Verified
                      </span>
                      <span>{formatDate(skill.verifiedAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSaving && setIsEditModalOpen(false)}></div>

          <div className="bg-surface relative z-10 w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-border-subtle animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-border-subtle bg-canvas/50 gap-4">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
                <h2 className="text-2xl font-bold text-text-main">Edit Profile</h2>
                <div className="flex bg-surface border border-border-subtle rounded-xl p-1">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'profile' ? 'bg-canvas shadow-sm text-text-main' : 'text-text-muted hover:text-text-main'}`}
                  >
                    Profile Info
                  </button>
                  <button
                    onClick={() => setActiveTab("projects")}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'projects' ? 'bg-canvas shadow-sm text-text-main' : 'text-text-muted hover:text-text-main'}`}
                  >
                    Projects
                  </button>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSaving}
                className="p-2 bg-canvas hover:bg-surface-hover rounded-full transition-colors text-text-muted hover:text-text-main cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-8">

              {errorMsg && (
                <div className="w-full bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium flex items-start gap-3 animate-in slide-in-from-top-2">
                  <div className="mt-0.5">
                    <X size={16} className="cursor-pointer text-red-400 hover:text-red-600" onClick={() => setErrorMsg("")} />
                  </div>
                  <span className="flex-1">{errorMsg}</span>
                </div>
              )}

              {activeTab === "profile" ? (
                <div className="space-y-8 animate-in fade-in duration-200">
                  {/* Profile Picture Upload */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-text-main border-b border-border-subtle pb-2">Profile Picture</h3>
                <div className="flex items-center gap-5">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-greenui shadow-md">
                      <img
                        src={editForm.imgUrl || user?.imgUrl || "/profiles/default.jpg"}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <Loader2 size={20} className="animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label
                      htmlFor="profile-image-upload"
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer border border-border-subtle bg-canvas hover:bg-surface-hover transition-colors ${isUploadingImage ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {isUploadingImage ? (
                        <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                      ) : (
                        <>Change Photo</>
                      )}
                    </label>
                    <input
                      id="profile-image-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <p className="text-xs text-text-muted">JPEG, PNG, WebP — max 5MB</p>
                  </div>
                </div>
              </div>

              {/* Basic Info Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-main border-b border-border-subtle pb-2">Basic Info</h3>

                <div>
                  <label className="block text-sm font-bold text-text-main mb-1.5 ml-1">Username</label>
                  <input
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl text-text-main bg-canvas border border-border-subtle focus:bg-white focus:outline-none focus:border-greenui focus:ring-4 focus:ring-greenui/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-main mb-1.5 ml-1">Title</label>
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="e.g. Fullstack Developer"
                    className="w-full px-4 py-3 rounded-xl text-text-main bg-canvas border border-border-subtle focus:bg-white focus:outline-none focus:border-greenui focus:ring-4 focus:ring-greenui/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-main mb-1.5 ml-1">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Write a short bio about yourself..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl text-text-main bg-canvas border border-border-subtle focus:bg-white focus:outline-none focus:border-greenui focus:ring-4 focus:ring-greenui/10 transition-all resize-none"
                  />
                </div>
              </div>

                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in duration-200">
                  {/* Projects Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-border-subtle pb-2">
                  <h3 className="text-lg font-semibold text-text-main">Projects</h3>
                  <button
                    onClick={handleAddProject}
                    className="text-sm font-bold text-brand-secondary flex items-center gap-1 hover:brightness-110 cursor-pointer"
                  >
                    <Plus size={16} /> Add Project
                  </button>
                </div>

                {editForm.projects.length === 0 ? (
                  <p className="text-text-muted text-sm italic text-center py-4">No projects added yet.</p>
                ) : (
                  <div className="space-y-6">
                    {editForm.projects.map((project, idx) => (
                      <div key={idx} className="bg-canvas border border-border-subtle rounded-2xl p-5 relative group">
                        <button
                          onClick={() => handleRemoveProject(idx)}
                          className="absolute top-4 right-4 text-red-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Remove Project"
                        >
                          <Trash2 size={18} />
                        </button>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-text-main mb-1 ml-1">Project Title <span className="text-red-500">*</span></label>
                            <input
                              value={project.title}
                              onChange={(e) => handleUpdateProject(idx, "title", e.target.value)}
                              placeholder="Project Name"
                              className="w-full px-4 py-2.5 rounded-xl text-sm text-text-main bg-surface border border-border-subtle focus:bg-white focus:outline-none focus:border-greenui transition-all pr-10"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-text-main mb-1 ml-1">Description <span className="text-text-muted font-normal text-[10px]">(Optional)</span></label>
                            <textarea
                              value={project.description}
                              onChange={(e) => handleUpdateProject(idx, "description", e.target.value)}
                              placeholder="Describe your project..."
                              rows={3}
                              className="w-full px-4 py-2.5 rounded-xl text-sm text-text-main bg-surface border border-border-subtle focus:bg-white focus:outline-none focus:border-greenui transition-all resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-text-main mb-1 ml-1">Tags (Comma separated) <span className="text-red-500">*</span></label>
                            <input
                              value={project.tags.join(", ")}
                              onChange={(e) => {
                                const tagsArray = e.target.value.split(",").map(t => t.trim()).filter(t => t);
                                handleUpdateProject(idx, "tags", tagsArray);
                              }}
                              placeholder="e.g. React, Node.js, Python"
                              className="w-full px-4 py-2.5 rounded-xl text-sm text-text-main bg-surface border border-border-subtle focus:bg-white focus:outline-none focus:border-greenui transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border-subtle bg-canvas/50 flex justify-end gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl font-bold text-text-main bg-surface border border-border-subtle hover:bg-surface-hover transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-8 py-2.5 rounded-xl font-bold text-white bg-greenui hover:brightness-105 shadow-sm shadow-greenui/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isSaving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}