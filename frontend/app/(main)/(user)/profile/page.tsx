"use client";

import { ExternalLink, Edit3, Award, CheckCircle, X, Plus, Trash2, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { User } from "@/types/user";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Edit form state
  const [editForm, setEditForm] = useState<{
    username: string;
    title: string;
    bio: string;
    projects: { title: string; description: string; tags: string[] }[];
  }>({
    username: "",
    title: "",
    bio: "",
    projects: []
  });

  // Mock skills as requested (not editing skills yet)
  const mockSkills = [
    { name: "React.js", level: "INTERMEDIATE", score: 82, date: "Oct 12, 2025" },
    { name: "Node.js", level: "BEGINNER", score: 67, date: "Oct 12, 2025" },
    { name: "Python", level: "ADVANCED", score: 95, date: "Sep 28, 2025" },
    { name: "JavaScript", level: "ADVANCED", score: 91, date: "Jan 15, 2026" },
    { name: "SQL", level: "INTERMEDIATE", score: 85, date: "Nov 05, 2025" },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return; // Handle not logged in (middleware usually catches this)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${apiUrl}/profile/me`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${text.substring(0, 50)}...`);
      }
      
      if (data.success) {
        setUser(data.user);
        setEditForm({
          username: data.user.username || "",
          title: data.user.title || "",
          bio: data.user.bio || "",
          projects: data.user.projects || []
        });
      } else {
        if (res.status === 401) {
          // Clear token if unauthorized
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          // Not setting user will show the "Please sign in" message
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
      setErrorMsg("");
      setIsSaving(true);
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      
      const res = await fetch(`${apiUrl}/profile/me`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      
      const data = await res.json();
      if (data.success) {
        setUser(data.user); // Update local state with saved data
        setIsEditModalOpen(false);
        // Also update local storage user if needed for navbar
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...storedUser, username: data.user.username }));
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

  const getLevelColorClass = (level: string) => {
    if (level === "ADVANCED") return "text-advancedtext";
    if (level === "INTERMEDIATE") return "text-intermediatetext";
    return "text-beginnertext";
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
            onClick={() => { setErrorMsg(""); setIsEditModalOpen(true); }}
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
        <h2 className="text-2xl font-bold text-text-main mb-6 transition-colors">Recommend</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Front-end", "Back-end", "Data Analyst"].map((role, idx) => (
            <div key={idx} className="bg-surface border-2 border-greenui dark:border-greenui/70 rounded-2xl p-6 text-center shadow-sm transition-colors duration-300">
              <h3 className="text-xl font-bold text-text-main transition-colors">{role}</h3>
              <div className="flex justify-center gap-2 mt-3">
                <span className="text-[10px] bg-canvas border border-border-subtle px-2 py-1 rounded-md font-bold text-text-muted transition-colors">REACT.JS</span>
                {idx === 1 && <span className="text-[10px] bg-canvas border border-border-subtle px-2 py-1 rounded-md font-bold text-text-muted transition-colors">NODE.JS</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* --- RECENT PROJECTS --- */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-text-main transition-colors">Recent Projects</h2>
            <button 
              onClick={() => { setErrorMsg(""); setIsEditModalOpen(true); }}
              className="text-sm font-semibold text-brand-secondary hover:underline cursor-pointer"
            >
              Edit Projects
            </button>
          </div>
          
          <div className="space-y-6">
            {!user.projects || user.projects.length === 0 ? (
              <p className="text-text-muted text-sm italic">No projects added yet.</p>
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

        {/* --- VERIFIED SKILLS --- */}
        <section>
          <h2 className="text-2xl font-bold text-text-main mb-6 transition-colors">Verified Skills</h2>
          <div className="space-y-4">
            {mockSkills.map((skill, idx) => (
              <div key={idx} className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden transition-colors duration-300">
                
                {/* แถบสีด้านซ้าย */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${idx % 2 === 0 ? "bg-greenui" : "bg-accent-orange"}`}></div>
                
                <div className="bg-canvas p-3 rounded-xl transition-colors">
                  <Award className={idx % 2 === 0 ? "text-greenui" : "text-accent-orange"} size={24} />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-text-main transition-colors">{skill.name}</h3>
                      <p className={`text-[10px] font-bold mt-0.5 ${getLevelColorClass(skill.level)} transition-colors`}>
                        {skill.level}
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
                    <span>{skill.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSaving && setIsEditModalOpen(false)}></div>
          
          <div className="bg-surface relative z-10 w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-border-subtle animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-border-subtle bg-canvas/50">
              <h2 className="text-2xl font-bold text-text-main">Edit Profile</h2>
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

              {/* Basic Info Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-main border-b border-border-subtle pb-2">Basic Info</h3>
                
                <div>
                  <label className="block text-sm font-bold text-text-main mb-1.5 ml-1">Username</label>
                  <input
                    value={editForm.username}
                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl text-text-main bg-canvas border border-border-subtle focus:bg-white focus:outline-none focus:border-greenui focus:ring-4 focus:ring-greenui/10 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-text-main mb-1.5 ml-1">Title</label>
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    placeholder="e.g. Fullstack Developer"
                    className="w-full px-4 py-3 rounded-xl text-text-main bg-canvas border border-border-subtle focus:bg-white focus:outline-none focus:border-greenui focus:ring-4 focus:ring-greenui/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-main mb-1.5 ml-1">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    placeholder="Write a short bio about yourself..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl text-text-main bg-canvas border border-border-subtle focus:bg-white focus:outline-none focus:border-greenui focus:ring-4 focus:ring-greenui/10 transition-all resize-none"
                  />
                </div>
              </div>

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
                            <label className="block text-xs font-bold text-text-main mb-1 ml-1">Project Title</label>
                            <input
                              value={project.title}
                              onChange={(e) => handleUpdateProject(idx, "title", e.target.value)}
                              placeholder="Project Name"
                              className="w-full px-4 py-2.5 rounded-xl text-sm text-text-main bg-surface border border-border-subtle focus:bg-white focus:outline-none focus:border-greenui transition-all pr-10"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-bold text-text-main mb-1 ml-1">Description</label>
                            <textarea
                              value={project.description}
                              onChange={(e) => handleUpdateProject(idx, "description", e.target.value)}
                              placeholder="Describe your project..."
                              rows={3}
                              className="w-full px-4 py-2.5 rounded-xl text-sm text-text-main bg-surface border border-border-subtle focus:bg-white focus:outline-none focus:border-greenui transition-all resize-none"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-bold text-text-main mb-1 ml-1">Tags (Comma separated)</label>
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