"use client";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SkillCard from "@/components/skill/SkillCard";

import { getSkills } from "@/lib/question-store";
import type { Skill } from "@/types/question";

const categoryTheme: Record<string, string> = {
  analyst: "#3b82f6",
  programming: "#22c55e",
  systems: "#f59e0b",
};

export default function UserDashboardPage() {
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [skillsData, setSkillsData] = useState<Skill[]>([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      document.cookie = "token=; path=/; max-age=0;";
      document.cookie = "user=; path=/; max-age=0;";
      window.location.href = "/";
    } else {
      const timer = setTimeout(() => setIsCheckingAuth(false), 100);
      return () => clearTimeout(timer);
    }
  }, [router]);

  useEffect(() => {
    setSkillsData(getSkills());
    setMounted(true);
  }, []);

  const filteredSkills = skillsData.filter((skill) => {
    let matchCategory = true;
    if (activeFilter === "Analyst") matchCategory = skill.category === "analyst";
    else if (activeFilter === "Programming") matchCategory = skill.category === "programming";
    else if (activeFilter === "Systems and Tools") matchCategory = skill.category === "systems";

    const matchSearch =
      skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.desc.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-[calc(100vh-80px)] animate-in fade-in slide-in-from-bottom-2 duration-500 transition-colors duration-300">
      {/* --- Main Content --- */}
      <main className="max-w-[1300px] mx-auto px-[5%] py-10">
        <section className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-8">
            Get Your Skills.<br />
            <span className="text-greenui">Get Verified</span>
          </h1>

          {/* Search Bar */}
          <div className="flex max-w-[600px] mx-auto mb-8 bg-surface rounded-lg border border-border-subtle shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-greenui transition-all duration-300">
            <div className="pl-4 flex items-center justify-center text-text-muted">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search (e.g. React, Python, AWS...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3.5 bg-transparent outline-none text-[15px] placeholder:text-text-muted text-text-main"
            />
            <button className="bg-[#19c3af] text-white px-8 font-bold text-[15px] hover:cursor-pointer hover:bg-teal-500 transition-colors">
              Search
            </button>
          </div>

          {/* Filters */}
          <div className="flex justify-center gap-3 md:gap-4 mb-10 flex-wrap">
            {["All", "Analyst", "Programming", "Systems and Tools"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`hover:cursor-pointer px-5 py-2.5 rounded-full text-sm font-semibold border border-border-subtle transition-all duration-200 ${activeFilter === filter
                    ? "bg-greenui text-[#1a1a1a] shadow-md dark:shadow-greenui/20"
                    : "bg-surface text-text-muted hover:border-text-muted hover:text-text-main"
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* แสดงข้อความถ้าระบบหาข้อมูลไม่เจอ */}
        {filteredSkills.length === 0 && (
          <div className="text-center text-text-muted mt-10">
            <p className="text-lg font-semibold">ไม่พบทักษะที่คุณค้นหา</p>
            <button onClick={() => { setSearchQuery(""); setActiveFilter("All"); }} className="mt-4 text-greenui underline cursor-pointer">
              ล้างการค้นหาทั้งหมด
            </button>
          </div>
        )}

        {/* Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => {
            const themeColor = categoryTheme[skill.category] || "#19c3af";

            return <SkillCard key={skill.id} skill={skill} themeColor={themeColor} />;
          })}
        </section>

      </main>
    </div>
  );
}