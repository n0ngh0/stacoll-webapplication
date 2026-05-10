"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
    const router = useRouter();
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            router.push("/explore");
        } else {
            setShouldRender(true);
        }
    }, [router]);

    if (!shouldRender) return <div className="min-h-screen bg-[#f7f7f8] font-sans animate-in fade-in duration-700" />;
    return (
        <div className="flex-1 flex flex-col">
            <div className="flex-grow bg-[#f9fafc] text-[#333333] font-sans animate-in fade-in duration-700 pb-20">
                
                <main className="px-[5%] max-w-[1200px] mx-auto mt-8 pb-12">
                    <section className="flex flex-col md:flex-row gap-7 mb-12 items-center">
                        <div className="flex-1 bg-[#b6ebe4] p-10 rounded-2xl">
                            <h1 className="text-[32px] font-extrabold text-[#1a1a1a] mb-5">Start with STACOLL</h1>
                            <p className="mb-4 text-[15px] text-[#444] leading-relaxed">
                                We are a skill assessment tool designed to help you quickly understand your strengths and weaknesses (gaps) through tests and by collecting the skills you have in each area.
                            </p>
                            <p className="text-[15px] text-[#444] leading-relaxed">
                                In addition, you can use your test results to create a resume, support your job applications, or share them on your profile.
                            </p>
                        </div>
                        <div className="flex-1 w-full flex items-center justify-center">
                            <img
                                src="/assets/landing-illustration.png"
                                alt="STACOLL Skill Assessment Illustration"
                                className="w-full h-auto object-contain max-h-[290px] animate-in fade-in slide-in-from-right duration-1000"
                            />
                        </div>
                    </section>

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