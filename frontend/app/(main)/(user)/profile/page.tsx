import { ExternalLink, Edit3, Award, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const user = {
    name: "Winny Pooh",
    role: "Developer",
    bio: "Interested in AI, software development, and building efficient systems. Passionate about learning new technologies and applying them to real-world projects.",
    profilePicture: "/profiles/default.jpg",
    skills: [
      { name: "React.js", level: "INTERMEDIATE", score: 82, date: "Oct 12, 2025" },
      { name: "Node.js", level: "BEGINNER", score: 67, date: "Oct 12, 2025" },
      { name: "Python", level: "ADVANCED", score: 95, date: "Sep 28, 2025" },
      { name: "JavaScript", level: "ADVANCED", score: 91, date: "Jan 15, 2026" },
      { name: "SQL", level: "INTERMEDIATE", score: 85, date: "Nov 05, 2025" },
    ],
    projects: [
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
    ]
  };

  const getLevelColorClass = (level: string) => {
    if (level === "ADVANCED") return "text-advancedtext";
    if (level === "INTERMEDIATE") return "text-intermediatetext";
    return "text-beginnertext";
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 transition-colors duration-300">
      
      {/* --- USER SECTION --- */}
      <section className="bg-bg-brand-subtle dark:bg-bg-brand-subtle/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 relative mb-12 transition-colors duration-300">
        <div className="relative">
          <div className="w-40 h-40 rounded-full border-4 border-greenui overflow-hidden shadow-lg">
            <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <button className="absolute bottom-1 right-1 bg-greenui p-2 rounded-lg text-white shadow-md hover:brightness-110 transition cursor-pointer">
            <Edit3 size={20} />
          </button>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-text-main transition-colors">{user.name}</h1>
              <p className="text-xl font-medium text-text-muted dark:text-greenui mt-1 transition-colors">My fav : AI / Developer</p>
            </div>
            <Link href="/export" className="bg-brand-secondary text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 self-center md:self-start hover:bg-brand-secondary-hover shadow-sm transition cursor-pointer">
              <ExternalLink size={18} /> Export
            </Link>
          </div>
          <p className="text-text-muted mt-4 max-w-2xl leading-relaxed transition-colors">
            {user.bio}
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
          <h2 className="text-2xl font-bold text-text-main mb-6 transition-colors">Recent Projects</h2>
          <div className="space-y-6">
            {user.projects.map((project, idx) => (
              <div key={idx} className="bg-surface border-2 border-brand-secondary dark:border-brand-secondary/70 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <h3 className="text-xl font-bold text-text-main transition-colors">{project.title}</h3>
                <p className="text-sm text-text-muted mt-3 leading-relaxed transition-colors">{project.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.tags.map((tag) => (
                    <span key={tag} className="text-[10px] bg-canvas border border-border-subtle px-2 py-1 rounded font-bold text-text-muted transition-colors">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- VERIFIED SKILLS --- */}
        <section>
          <h2 className="text-2xl font-bold text-text-main mb-6 transition-colors">Verified Skills</h2>
          <div className="space-y-4">
            {user.skills.map((skill, idx) => (
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
    </div>
  );
}