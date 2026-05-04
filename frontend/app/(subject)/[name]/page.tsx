"use client";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, CircleQuestionMark, Clock, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export default function SubjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const subjectName = decodeURIComponent(params.name as string);
    const subject = {
        name: subjectName,
        desc: "SQL (Structured Query Language) คือภาษามาตรฐานที่ใช้สำหรับสื่อสาร จัดการ และดึงข้อมูลจากระบบฐานข้อมูลเชิงสัมพันธ์ (Relational Database) เช่น การค้นหา เพิ่ม หรือลบข้อมูลในตาราง",
        category: "analyst",
        difficulty: "Beginner",
        estimated_time: 45,
        question_count: 15,
        mode: "Desktop Only",
        levels: [
            {
                id: "Beginner",
                title: "Beginner",
                description: "ทำพื้นฐานทั่วไปได้",
                color: "bg-[#FEF9C3]",
                borderColor: "border-[#FDE047]",
            },
            {
                id: "Intermediate",
                title: "Intermediate",
                description: "สามารถประยุกต์ใช้งานได้",
                color: "bg-[#a9efd2]",
                borderColor: "border-[#6bdaab]",
            },
            {
                id: "Advanced",
                title: "Advanced",
                description: "เข้าใจจุดแข็งของภาษานี้จริงๆ",
                color: "bg-[#e2bced]",
                borderColor: "border-[#c578db]",
            }
        ]
    }
    const categoryTheme: Record<string, { border: string, bg: string }> = {
        analyst: { border: "border-[#b3caff]", bg: "bg-[#e6f0ff]" },
        programming: { border: "border-[#b3e6cc]", bg: "bg-[#aeefd4]" },
        systems: { border: "border-[#ffdab3]", bg: "bg-[#fedfc3]" },
    };

    const [selectedLevel, setSelectedLevel] = useState(subject.difficulty);
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

    return (
        <div className={`flex-1 min-h-screen ${categoryTheme[subject.category].bg} flex flex-col items-center py-10 px-4`}>
            <div className="w-full max-w-[850px] bg-white rounded-[32px] shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
                {/* Header Navigation */}
                <div className="px-8 py-4 border-b border-gray-100">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium gap-1"
                    >
                        <ChevronLeft size={18} />
                        Back to Skills
                    </button>
                </div>

                {/* Subject Title Hero */}
                <div className={`py-10 flex items-center justify-center relative overflow-hidden ${categoryTheme[subject.category].bg}`}>
                    <h1 className="text-5xl font-extrabold text-[#1a1a1a] drop-shadow-sm z-10">{subjectName}</h1>
                </div>

                <div className="p-8 md:p-12 space-y-10">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                                <Clock className="text-[#049CD3]" size={20} />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Duration</span>
                            <span className="text-xl font-bold text-gray-800">{subject.estimated_time} Minutes</span>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                                <CircleQuestionMark className="text-[#049CD3]" size={20} />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Questions</span>
                            <span className="text-xl font-bold text-gray-800">{subject.question_count} Questions</span>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                                <Monitor className="text-[#049CD3]" size={20} />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">&nbsp;</span>
                            <span className="text-xl font-bold text-gray-800">{subject.mode}</span>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-800">Description</h2>
                        <div className="min-h-[122px] bg-[#F3F4F6] p-6 rounded-2xl text-gray-600 text-[15px] leading-relaxed">
                            {subject.desc}
                        </div>
                    </div>

                    {/* Skill Level Section */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-800">Skill Level</h2>
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            {subject.levels.map((level, index) => (
                                <div key={level.id} className="flex-1 flex items-center w-full">
                                    <div
                                        className={`min-h-[125px] relative flex-1 p-5 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 h-full ${selectedLevel === level.id
                                                ? `${level.borderColor} ${level.color} shadow-md`
                                                : 'border-transparent bg-[#F3F4F6]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedLevel === level.id ? 'border-[#1a1a1a]' : 'border-gray-400'
                                                }`}>
                                                {selectedLevel === level.id && <div className="w-2 h-2 rounded-full bg-[#1a1a1a]"></div>}
                                            </div>
                                            <span className="font-bold text-gray-800">{level.title}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium">{level.description}</p>
                                    </div>

                                    {index < subject.levels.length - 1 && (
                                        <div className="hidden md:block mx-2 text-gray-400">
                                            <ChevronLeft size={20} className="rotate-180" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-center pt-6">
                        <button className="bg-[#049CD3] hover:bg-[#038bbd] text-white font-bold py-4 px-20 rounded-full text-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-95">
                            Start
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
