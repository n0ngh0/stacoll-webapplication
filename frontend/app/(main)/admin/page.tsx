"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Database, Search, Settings,
  Filter, ChevronDown, Check,
  Plus
} from "lucide-react";
import type { Skill } from "@/types/skill";
import { CATEGORY_THEMES } from "@/types/question";
import AdminSkillCard from "@/components/admin/AdminSkillCard";

export default function AdminDashboardPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>(["analyst", "programming", "systems"]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchSkills();
    setMounted(true);
  }, []);

  const fetchSkills = async () => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      // Using public skills endpoint for listing
      const res = await fetch(`${apiUrl}/skills`);
      const data = await res.json();
      
      if (data.success) {
        setSkills(data.skills);
      } else {
        console.error("Failed to fetch skills:", data.message);
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-[9999] bg-canvas flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    );
  }

  const toggleFilter = (category: string) => {
    if (category === "All") {
      setActiveFilters([]);
      return;
    }

    const catLower = category.toLowerCase();
    if (activeFilters.includes(catLower)) {
      setActiveFilters(activeFilters.filter(c => c !== catLower));
    } else {
      setActiveFilters([...activeFilters, catLower]);
    }
  };

  const getFilterButtonText = () => {
    if (activeFilters.length === 0) return "All Categories";
    if (activeFilters.length === 1) {
      return activeFilters[0].charAt(0).toUpperCase() + activeFilters[0].slice(1);
    }
    return `${activeFilters.length} Selected`;
  };

  const handleAddCategory = () => {
    setIsFilterOpen(false);
    setTimeout(() => {
      const newCat = prompt("Enter new category name:");
      if (newCat && !categories.includes(newCat.toLowerCase())) {
        const catLower = newCat.toLowerCase();
        setCategories([...categories, catLower]);
        setActiveFilters([...activeFilters, catLower]);
      }
    }, 100);
  };

  const handleDeleteSkill = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete ${title}?`)) {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        const res = await fetch(`${apiUrl}/admin/skills/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        
        if (data.success) {
          setSkills(skills.filter(s => s._id !== id));
          setActiveMenuId(null);
        } else {
          alert(`Failed to delete skill: ${data.message}`);
        }
      } catch (error) {
        console.error("Error deleting skill:", error);
        alert("An error occurred while deleting the skill.");
      }
    }
  };

  const filteredSkills = skills.filter((skill) => {
    const matchCategory = activeFilters.length === 0 || activeFilters.includes(skill.category.toLowerCase());
    const matchSearch =
      skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-[calc(100vh-80px)] bg-canvas animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* Header Section */}
      <div className="bg-surface border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-[5%] py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-text-muted mb-1">
              <span>Admin Control Panel</span>
            </div>
            <h1 className="text-2xl font-bold text-text-main tracking-tight">
              Skill Management
            </h1>
          </div>
          <div className="shrink-0">
            <Link
              href="/admin/skills/create"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-greenbutton text-white text-sm font-bold rounded-xl hover:bg-greenbutton/90 dark:text-black transition-colors shadow-sm"
            >
              <Plus size={16} strokeWidth={3.5} />
              Create New Skill
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-[5%] py-8 space-y-6">

        {/* Control Bar */}
        <section className="bg-surface border border-border-subtle p-3 rounded-lg shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">

          <div className="relative w-full md:w-96 shrink-0">
            <div className="flex items-center bg-surface rounded-lg border border-border-subtle overflow-hidden">
              <div className="pl-3 flex items-center text-text-muted">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search skills by name or detail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-transparent outline-none text-sm placeholder:text-text-muted text-text-main"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">

            {/* Multi-select Filter Dropdown */}
            <div className="relative w-full md:w-auto" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-full md:w-auto flex items-center justify-between gap-2 px-4 py-2 border rounded-md text-sm transition-colors focus:outline-none cursor-pointer ${activeFilters.length > 0
                  ? "bg-gray-50 dark:bg-gray-700 border-gray-400 dark:border-gray-600 dark:hover:bg-gray-800/10 text-text-main"
                  : "bg-canvas dark:bg-surface border-border-subtle text-text-main hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Filter size={15} className="text-text-muted" />
                  <span className="font-medium min-w-[90px] text-left">
                    {getFilterButtonText()}
                  </span>
                </div>
                <ChevronDown size={14} className={`text-text-muted transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`} />
              </button>

              {/* เมนู Dropdown */}
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-full md:w-64 bg-white dark:bg-surface border border-border-subtle dark:border-border-subtle rounded-lg shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">

                  <div className="max-h-[260px] overflow-y-auto p-2.5 no-scrollbar">

                    {/* ปุ่ม All Categories */}
                    <button
                      onClick={() => toggleFilter("All")}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${activeFilters.length === 0 ? "bg-gray-100 dark:bg-gray-700 font-semibold text-text-main" : "text-text-muted dark:text-text-muted hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                    >
                      <span>All Categories</span>
                      {activeFilters.length === 0 && <Check size={16} className="text-text-main" />}
                    </button>

                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />

                    {/* รายการหมวดหมู่ */}
                    {categories.map((cat) => {
                      const formattedCat = cat.charAt(0).toUpperCase() + cat.slice(1);
                      const isSelected = activeFilters.includes(cat.toLowerCase());

                      return (
                        <button
                          key={cat}
                          onClick={() => toggleFilter(cat)}
                          className={`w-full flex items-center justify-between px-3 py-2 my-0.5 text-sm rounded-md transition-colors cursor-pointer ${isSelected ? "bg-gray-100 dark:bg-gray-700 font-semibold text-text-main" : "text-text-muted dark:text-text-muted hover:bg-gray-50 dark:hover:bg-gray-800/60"
                            }`}
                        >
                          <span>{formattedCat}</span>
                          {/* ถูกเลือก */}
                          {isSelected && <Check size={16} className="text-text-main" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* ปุ่มเพิ่มหมวดหมู่ */}
                  <div className="p-1.5 bg-gray-50 dark:bg-transparent border-t border-border-subtle dark:border-t border-border-subtle">
                    <button
                      onClick={handleAddCategory}
                      className="w-full flex items-center gap-2 px-2.5 py-2 text-sm font-medium text-text-main bg-white dark:bg-surface border border-gray-300 dark:border-gray-700 rounded-md dark:hover:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                    >
                      <Plus size={16} />
                      Manage Category...
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden lg:flex items-center gap-2 pl-4 pr-4 border-l border-border-subtle text-sm font-medium text-text-muted shrink-0">
              <Database size={15} />
              <span>Total: {skills.length}</span>
            </div>
          </div>
        </section>

        {/* Skills Grid */}
        <section>
          {filteredSkills.length === 0 && (
            <div className="bg-surface border border-dashed border-border-subtle rounded-lg py-16 flex flex-col items-center justify-center text-center">
              <Settings size={32} className="text-gray-300 mb-3" />
              <h3 className="text-text-main font-semibold">No skills found</h3>
              {/* ปุ่ม Clear ล้างการกรองทั้งหมด */}
              <button onClick={() => { setSearchQuery(""); setActiveFilters([]); }} className="mt-2 text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                Clear all filters
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {isLoading ? (
               <div className="col-span-full py-10 flex justify-center">
                 <div className="w-8 h-8 border-4 border-gray-300 border-t-greenui rounded-full animate-spin" />
               </div>
            ) : filteredSkills.map((skill) => {
              const qCount = (skill as any).actualQuestionCount || 0;
              const themeColor = CATEGORY_THEMES[skill.category] || "#19c3af";

              return (
                <AdminSkillCard key={skill._id} skill={skill} qCount={qCount} themeColor={themeColor} onDelete={handleDeleteSkill} />
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}