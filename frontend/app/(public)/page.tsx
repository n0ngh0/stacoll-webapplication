"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpenCheck, Briefcase, WalletCards } from "lucide-react";
import { getToken } from "@/lib/auth-session";

export default function LandingPage() {
    const router = useRouter();
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (getToken()) {
            window.location.href = "/explore";
        } else {
            setShouldRender(true);
        }
    }, [router]);

    if (!shouldRender) return <div className="min-h-screen bg-[#f7f7f8] font-sans animate-in fade-in duration-700" />;
    return (
        <div className="flex-1 flex flex-col">
            <div className="flex-grow bg-[#f9fafc] text-[#333333] font-sans animate-in fade-in duration-700">

                <main className="px-[5%] max-w-[1200px] mx-auto mt-12 pb-12">
                    <section className="flex flex-col md:flex-row gap-12 mb-20 items-center">
                        <div className="flex-1 flex flex-col justify-center relative z-10">
                            <h1 className="text-5xl font-extrabold text-[#1a1a1a] mb-6 leading-[1.1] tracking-tight">
                                Validate Your Skills.<br />
                                Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10DFAE] to-[#00a3e0]">Skill Wallet.</span>
                            </h1>
                            <p className="mb-8 text-lg text-[#555] leading-relaxed max-w-[90%]">
                                STACOLL is skill assessment tool designed to help you quickly understand your strengths and weaknesses through tests and by collecting the skills you have in each area.
                            </p>

                            <div className="flex flex-wrap gap-4 items-center">
                                <a href="/signup" className="px-8 py-4 bg-[#1a1a1a] text-white rounded-full font-bold text-lg hover:bg-[#333] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2">
                                    Create Account
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                </a>
                                <a href="/signin" className="px-8 py-4 bg-white text-[#1a1a1a] border border-[#1a1a1a] rounded-full font-bold text-lg hover:bg-gray-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    Sign In
                                </a>
                            </div>
                        </div>
                        <div className="flex-1 w-full flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#10DFAE]/20 to-[#00a3e0]/20 blur-[80px] -z-10 rounded-full w-full h-full m-auto"></div>
                            <img
                                src="/assets/landing-illustration.png"
                                alt="STACOLL Skill Assessment Dashboard"
                                className="w-full h-auto object-contain max-h-[450px] drop-shadow-xl animate-in fade-in zoom-in-95 duration-1000"
                            />
                        </div>
                    </section>

                    <div className="py-8 border-t border-[#eaeaea] text-center"></div>

                    <section className="mb-24">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-extrabold text-[#1a1a1a] mb-4">How STACOLL Works</h2>
                            <p className="text-[#666] text-lg max-w-2xl mx-auto">A streamlined process to level up your career profile.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-8 bg-white rounded-3xl border border-[#eaeaea] text-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-16 h-16 mx-auto bg-[#e0f4f9] text-[#00a3e0] rounded-2xl flex items-center justify-center mb-6">
                                    <BookOpenCheck width={32} height={32} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-[#1a1a1a]">1. Take Assessments</h3>
                                <p className="text-[#666]">Complete industry-standard tests to evaluate your current knowledge and discover skill gaps.</p>
                            </div>
                            <div className="p-8 bg-white rounded-3xl border border-[#eaeaea] text-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-16 h-16 mx-auto bg-[#e6f9f1] text-[#10DFAE] rounded-2xl flex items-center justify-center mb-6">
                                    <WalletCards width={32} height={32} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-[#1a1a1a]">2. Collect Skills</h3>
                                <p className="text-[#666]">Earn verified badges and store them securely in your personal digital Skill Wallet.</p>
                            </div>
                            <div className="p-8 bg-white rounded-3xl border border-[#eaeaea] text-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-16 h-16 mx-auto bg-[#fff6ed] text-[#f59e0b] rounded-2xl flex items-center justify-center mb-6">
                                    <Briefcase width={32} height={32} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-[#1a1a1a]">3. Build Your Resume</h3>
                                <p className="text-[#666]">Generate powerful resumes backed by verified data to stand out to global employers.</p>
                            </div>
                        </div>
                    </section>

                    <div className="py-8 border-t border-[#eaeaea] text-center"></div>

                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-extrabold text-[#1a1a1a] mb-4">Explore Skill Domains</h2>
                        <p className="text-[#666] text-lg max-w-2xl mx-auto">Choose an area to begin your assessment journey.</p>
                    </div>

                    {/* Analyst Skills Section */}
                    <section className="mb-12">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold flex items-center mb-2.5 text-[#1a1a1a]">
                                <div className="w-[6px] h-[30px] bg-[#a8bff8] mr-4 rounded-[3px]"></div>
                                Analyst Skills
                            </h2>
                            <p className="text-[#666] text-sm max-w-[90%] leading-relaxed">
                                Data analysis skills play an important role in understanding and using data for analysis, decision-making, and developing business strategies. This skill helps you transform complex data into valuable insights that can be applied effectively in real-world situations.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {['SQL', 'Data Literacy', 'Data Engineering Proficiency', 'Exploratory Data Analysis'].map((skill, index) => (
                                <div key={index} className="p-5 rounded-xl shadow-sm bg-[#c8d9fb] border border-transparent hover:border-[#a8bff8]/50 transition-colors duration-300">
                                    <h3 className="text-lg font-bold text-[#222] mb-1.5">{skill}</h3>
                                    <p className="text-xs text-[#555] font-medium">Beginner, Intermediate, Advanced</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Programming Skills Section */}
                    <section className="mb-12">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold flex items-center mb-2.5 text-[#1a1a1a]">
                                <div className="w-[6px] h-[30px] bg-[#80e2b9] mr-4 rounded-[3px]"></div>
                                Programming Skills
                            </h2>
                            <p className="text-[#666] text-sm max-w-[90%] leading-relaxed">
                                Programming skills are a fundamental core of building and developing digital products, including writing efficient code, to prepare for working with new technologies in the future.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {['Python', 'C/C++', 'Java', 'HTML', 'JavaScript', 'CSS', 'React.js', 'Node.js'].map((skill, index) => (
                                <div key={index} className="p-5 rounded-xl shadow-sm bg-[#a7ebd1] border border-transparent hover:border-[#80e2b9]/50 transition-colors duration-300">
                                    <h3 className="text-lg font-bold text-[#222] mb-1.5">{skill}</h3>
                                    <p className="text-xs text-[#555] font-medium">Beginner, Intermediate, Advanced</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Systems and Tools Skills Section */}
                    <section className="mb-12">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold flex items-center mb-2.5 text-[#1a1a1a]">
                                <div className="w-[6px] h-[30px] bg-[#fad1a5] mr-4 rounded-[3px]"></div>
                                Systems and Tools Skills
                            </h2>
                            <p className="text-[#666] text-sm max-w-[90%] leading-relaxed">
                                Systems and Tools skills are essential for working effectively with technologies and software. These skills help you choose the right tools, manage systems efficiently, and work confidently in digital environments.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {['Git/GitHub', 'Docker', 'Linux', 'Basic Networking'].map((skill, index) => (
                                <div key={index} className="p-5 rounded-xl shadow-sm bg-[#fde1c5] border border-transparent hover:border-[#fad1a5]/50 transition-colors duration-300">
                                    <h3 className="text-lg font-bold text-[#222] mb-1.5">{skill}</h3>
                                    <p className="text-xs text-[#555] font-medium">Beginner, Intermediate, Advanced</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    )
}