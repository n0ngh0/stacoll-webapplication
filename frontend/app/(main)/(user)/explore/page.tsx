"use client";
import { Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Skill } from "@/types/skill";
import { apiFetch } from "@/lib/api/client";
import { getAvailableUserLevels } from "@/lib/api/problems";

const categoryTheme: Record<string, string> = {
  analyst: "#3b82f6",
  programming: "#22c55e",
  systems: "#f59e0b",
};

export default function UserDashboardPage() {
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsCheckingAuth(false), 0);
    return () => clearTimeout(timer);
  }, []);

  // Fetch skills จาก API
  useEffect(() => {
    if (!isCheckingAuth) {
      fetchSkills();
    }
  }, [isCheckingAuth]);

  const fetchSkills = async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch("/skills");
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

  if (isCheckingAuth) {
    return (
      <div className="fixed inset-0 z-[9999] bg-canvas flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    );
  }

  const filteredSkills = skills.filter((skill) => {
    let matchCategory = true;
    if (activeFilter === "Analyst") matchCategory = skill.category === "analyst";
    else if (activeFilter === "Programming") matchCategory = skill.category === "programming";
    else if (activeFilter === "Systems and Tools") matchCategory = skill.category === "systems";

    const matchSearch =
      skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());

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
            <button className="bg-greenbutton text-white dark:text-black px-8 font-bold text-[15px] hover:cursor-pointer hover:bg-greenbutton/90 transition-colors">
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
                  ? "bg-greenbutton text-white dark:text-black shadow-md dark:shadow-greenbutton/20"
                  : "bg-surface text-text-muted hover:border-text-muted hover:text-text-main"
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-greenui" />
          </div>
        )}

        {/* Empty State — ไม่มี skills ใน database */}
        {!isLoading && skills.length === 0 && (
          <div className="flex justify-center mt-10">
            <div className="bg-surface border border-border-subtle rounded-2xl p-10 text-center max-w-md transition-colors duration-300">
              <p className="text-text-muted font-medium text-lg">
                No skills available at the moment. Please check back later.
              </p>
            </div>
          </div>
        )}

        {/* แสดงข้อความถ้าระบบหาข้อมูลไม่เจอ (search/filter) */}
        {!isLoading && skills.length > 0 && filteredSkills.length === 0 && (
          <div className="text-center text-text-muted mt-10">
            <p className="text-lg font-semibold">ไม่พบทักษะที่คุณค้นหา</p>
            <button onClick={() => { setSearchQuery(""); setActiveFilter("All"); }} className="mt-4 text-greenbutton underline cursor-pointer">
              ล้างการค้นหาทั้งหมด
            </button>
          </div>
        )}

        {/* Cards Grid */}
        {!isLoading && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill) => {
              const themeColor = categoryTheme[skill.category] || "#19c3af";
              const isImageIcon = skill.icon.startsWith("http") || skill.icon.startsWith("/");

              return (
                <Link
                  key={skill._id}
                  href={`/skill/${skill._id}`}
                  style={{ "--theme-color": themeColor } as React.CSSProperties}
                  className="group bg-surface rounded-xl p-6 shadow-sm flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--theme-color)]/20 dark:hover:shadow-black/30 cursor-pointer border-2 border-[var(--theme-color)]/20 dark:border-[var(--theme-color)]/30"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    {/* Card Icon */}
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl overflow-hidden transition-colors duration-300 bg-[var(--theme-color)]/10 text-[var(--theme-color)] dark:bg-[var(--theme-color)]/15">
                      {isImageIcon ? (
                        <img src={skill.icon} alt={skill.title} className="w-8 h-8 object-contain" />
                      ) : (
                        skill.icon ? skill.icon.substring(0, 2).toUpperCase() : skill.title.substring(0, 2).toUpperCase()
                      )}
                    </div>

                    {/* Category Badge */}
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--theme-color)]/10 text-[var(--theme-color)] border border-[var(--theme-color)]/20 uppercase tracking-wider transition-colors duration-300">
                      {skill.category}
                    </span>
                  </div>

                  {/* Card Info */}
                  <h3 className="text-[22px] font-bold text-text-main mb-2 transition-colors duration-300">{skill.title}</h3>
                  <p className="text-[13px] text-text-muted leading-relaxed mb-6 grow transition-colors duration-300">
                    {skill.description}
                  </p>

                  {/* Card Footer (Level Tags & Arrow) */}
                  <div className="flex justify-between items-center mt-auto">
                    <div className="flex flex-wrap gap-1.5">
                      {getAvailableUserLevels(skill.levels).map((lvl) => {
                        const levelStyleMap: Record<string, string> = {
                          beginner: "bg-beginnerbg dark:bg-beginnertext/20 text-beginnertext",
                          intermediate: "bg-intermediatebg dark:bg-intermediatetext/20 text-intermediatetext",
                          advanced: "bg-advancedbg dark:bg-advancedbg/20 text-advancedtext",
                        };
                        return (
                          <span
                            key={lvl.level}
                            className={`text-[10px] font-bold px-2 py-1 rounded uppercase transition-colors duration-300 ${levelStyleMap[lvl.level] || ""}`}
                          >
                            {lvl.level}
                          </span>
                        );
                      })}
                    </div>
                    <span className="text-[var(--theme-color)] font-bold text-xl transition-transform transform group-hover:translate-x-1">→</span>
                  </div>
                </Link>
              );
            })}
          </section>
        )}

      </main>
    </div>
  );
}