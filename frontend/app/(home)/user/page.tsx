"use client";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const skillsData = [
  { id: 1, title: "SQL", icon: "SQL", desc: "ภาษามาตรฐานที่ใช้สำหรับสื่อสาร จัดการ และดึงข้อมูลจากระบบฐานข้อมูลเชิงสัมพันธ์", category: "analyst" },
  { id: 2, title: "Python", icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/1280px-Python-logo-notext.svg.png", desc: "ภาษาโปรแกรมมิ่งยอดนิยมที่เขียนและอ่านง่ายมาก นำไปใช้งานได้ครอบจักรวาล", category: "programming" },
  { id: 3, title: "Git/GitHub", icon: "https://cdn-icons-png.flaticon.com/512/25/25231.png", desc: "Git คือระบบที่คอยบันทึกประวัติการแก้ไขโค้ด (Version Control)", category: "systems" },
  { id: 4, title: "Data Literacy", icon: "https://www.freeiconspng.com/thumbs/sql-server-icon-png/sql-server-icon-png-29.png", desc: "ทักษะความรู้เท่าทันข้อมูล หรือความสามารถในการอ่าน ทำความเข้าใจ วิเคราะห์ และสื่อสารเรื่องราวจากข้อมูล", category: "analyst" },
  { id: 5, title: "C/C++", icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/ISO_C%2B%2B_Logo.svg/1920px-ISO_C%2B%2B_Logo.svg.png", desc: "ภาษาโปรแกรมมิ่งระดับตำนานที่ขึ้นชื่อเรื่อง 'ความเร็วและประสิทธิภาพ'", category: "programming" },
  { id: 6, title: "Docker", icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/docker-icon.png", desc: "เครื่องมือจำลองสภาพแวดล้อมที่เรียกว่า 'Container'", category: "systems" },
];

const categoryTheme: Record<string, { border: string, iconBg: string, iconText: string }> = {
  analyst: { border: "border-[#b3caff]", iconBg: "bg-[#e6f0ff]", iconText: "text-[#0055ff]" },
  programming: { border: "border-[#b3e6cc]", iconBg: "bg-[#e6ffed]", iconText: "text-[#009933]" },
  systems: { border: "border-[#ffdab3]", iconBg: "bg-[#fff0e6]", iconText: "text-[#ff6600]" },
};

export default function UserDashboardPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    } else {
      const timer = setTimeout(() => setIsCheckingAuth(false), 100);
      return () => clearTimeout(timer);
    }
  }, [router]);
  if (isCheckingAuth) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white animate-pulse"></div>
    );
  }

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
    <div className="min-h-[calc(100vh-80px)] bg-[#f9fafc] text-[#222] animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* --- Main Content --- */}
      <main className="max-w-[1300px] mx-auto px-[5%] py-10">

        {/* Hero Section */}
        <section className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-8">
            Get Your Skills.<br />
            <span className="text-[#19c3af]">Get Verified</span>
          </h1>

          {/* Search Bar */}
          <div className="flex max-w-[600px] mx-auto mb-8 bg-white rounded-lg border border-[#eaeaea] shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-[#19c3af] transition-all">
            <div className="pl-4 flex items-center justify-center text-gray-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search (e.g. React, Python, AWS...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3.5 outline-none text-[15px]"
            />
            <button className="bg-[#19c3af] text-white px-8 font-bold text-[15px] hover:bg-teal-500 transition-colors">
              Search
            </button>
          </div>

          {/* Filters */}
          <div className="flex justify-center gap-3 md:gap-4 mb-10 flex-wrap">
            {["All", "Analyst", "Programming", "Systems and Tools"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${activeFilter === filter
                  ? "bg-[#19c3af] text-white shadow-md"
                  : "bg-[#e9ecef] text-[#666] hover:bg-gray-200"
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* แสดงข้อความถ้าระบบหาข้อมูลไม่เจอ */}
        {filteredSkills.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p className="text-lg font-semibold">ไม่พบทักษะที่คุณค้นหา</p>
            <button onClick={() => { setSearchQuery(""); setActiveFilter("All"); }} className="mt-4 text-[#19c3af] underline">
              ล้างการค้นหาทั้งหมด
            </button>
          </div>
        )}

        {/* Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => {
            const theme = categoryTheme[skill.category] || categoryTheme.programming;
            const isImageIcon = skill.icon.startsWith("http") || skill.icon.startsWith("/");

            return (
              <div
                key={skill.id}
                className={`bg-white rounded-xl p-6 shadow-sm flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer border-2 ${theme.border}`}
              >
                {/* Card Icon */}
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 font-bold text-xl overflow-hidden ${theme.iconBg} ${theme.iconText}`}>
                  {isImageIcon ? (
                    <img src={skill.icon} alt={skill.title} className="w-8 h-8 object-contain" />
                  ) : (
                    skill.icon
                  )}
                </div>

                {/* Card Info */}
                <h3 className="text-[22px] font-bold text-[#222] mb-2">{skill.title}</h3>
                <p className="text-[13px] text-[#666] leading-relaxed mb-6 grow">
                  {skill.desc}
                </p>

                {/* Card Footer (Tags & Arrow) */}
                <div className="flex justify-between items-center mt-auto">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#fff5cc] text-[#b38600] uppercase">Beginner</span>
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#ccffcc] text-[#008000] uppercase">Intermediate</span>
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#e6ccff] text-[#6600cc] uppercase">Advanced</span>
                  </div>
                  <span className="text-[#19c3af] font-bold text-xl transition-transform transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            );
          })}
        </section>

      </main>
    </div>
  );
}