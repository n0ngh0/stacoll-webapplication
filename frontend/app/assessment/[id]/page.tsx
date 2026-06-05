"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import AssessmentHeader from "@/components/layouts/assessment-header";
import CodingQuestion from "@/components/layouts/coding-question";
import ChoiceQuestion from "@/components/layouts/choice-question";

import { useSearchParams } from "next/navigation";

export default function ExamPage() {
    const params = useParams();
    const router = useRouter();
    const rawSkillId = (params?.id || "skill-assessment") as string;

    const searchParams = useSearchParams();
    const selectedLevel = searchParams?.get("level") || "beginner";

    const [skillTitle, setSkillTitle] = useState("");
    const [problems, setProblems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30 * 60);
    const [isFinished, setIsFinished] = useState(false);
    const [answers, setAnswers] = useState<{ [key: string]: any }>({});

    const currentQuestion = problems[currentIndex];
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === problems.length - 1;

    // ระบบ Timer + Auto Submit
    useEffect(() => {
        if (timeLeft <= 0) {
            setIsFinished(true);
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const handleUpdateAnswer = useCallback((val: any) => {
        if (!currentQuestion) return;
        setAnswers(prev => ({ ...prev, [currentQuestion._id]: val }));
    }, [currentQuestion]);

    const handleNext = useCallback(() => {
        if (!isLast) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    }, [isLast]);

    const handleBack = useCallback(() => {
        if (!isFirst) setCurrentIndex(prev => prev - 1);
    }, [isFirst]);

    // Fetch problems from API
    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const { apiFetch } = await import("@/lib/api/client");
                const [skillRes, assessRes] = await Promise.all([
                    apiFetch(`/skills/${rawSkillId}`),
                    apiFetch(`/assessment/${rawSkillId}/start`, {
                        method: "POST",
                        body: JSON.stringify({ level: selectedLevel }),
                    }),
                ]);

                const skillData = await skillRes.json();
                const data = await assessRes.json();
                if (skillData.success && skillData.skill?.title) {
                    setSkillTitle(skillData.skill.title);
                }
                if (data.success) {
                    setProblems(data.problems);
                    const levelMeta = skillData.success
                        ? skillData.skill?.levels?.find((l: { level: string }) => l.level === selectedLevel)
                        : null;
                    const minutes = levelMeta?.estimatedTime ?? 30;
                    setTimeLeft(minutes * 60);
                } else {
                    setError(data.message);
                }
            } catch (err) {
                setError("Error starting assessment");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProblems();
    }, [rawSkillId, selectedLevel, router]);

    // Effect to submit when finished
    useEffect(() => {
        if (isFinished && !isSubmitting && problems.length > 0) {
            setIsSubmitting(true);
            const submitAnswers = async () => {
                try {
                    const { apiFetch } = await import("@/lib/api/client");

                    const res = await apiFetch(`/assessment/${rawSkillId}/submit`, {
                        method: "POST",
                        body: JSON.stringify({ level: selectedLevel, answers })
                    });
                    
                    const data = await res.json();
                    if (data.success) {
                        router.push(`/assessment/${rawSkillId}/result?score=${data.score}&passed=${data.passed}&level=${selectedLevel}`);
                    } else {
                        setError(data.message);
                    }
                } catch (err) {
                    setError("Error submitting assessment");
                }
            };
            submitAnswers();
        }
    }, [isFinished, isSubmitting, answers, problems, rawSkillId, selectedLevel, router]);

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-canvas p-4 text-center">
                <Loader2 className="w-12 h-12 text-greenui animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-canvas p-4 text-center">
                <div className="bg-surface p-8 rounded-3xl shadow-xl border border-border-subtle max-w-md w-full flex flex-col items-center">
                    <p className="text-red-500 font-bold text-lg mb-4">{error}</p>
                    <button onClick={() => router.push(`/skill/${rawSkillId}`)} className="text-brand-secondary hover:underline cursor-pointer">Go Back</button>
                </div>
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-canvas p-4 text-center">
                <div className="bg-surface p-8 sm:p-10 rounded-3xl shadow-xl border border-border-subtle max-w-md w-full animate-in zoom-in-95 duration-500 flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-brand-secondary animate-spin mb-4" />
                    <h2 className="text-2xl font-black text-text-main mb-2 tracking-tight">
                        Calculating Results...
                    </h2>
                    <p className="text-text-muted text-[15px]">
                        Please wait while we evaluate your answers for <strong className="text-text-main">{skillTitle}</strong>.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col bg-canvas overflow-hidden">
            <AssessmentHeader
                current={currentIndex + 1}
                total={problems.length}
                title={skillTitle.toUpperCase()}
                timeLeft={formatTime(timeLeft)}
                isUrgent={timeLeft < 300}
                skillId={rawSkillId}
            />

            <div className="flex-1 flex overflow-hidden">
                {currentQuestion.questionType === "coding" ? (
                    <CodingQuestion
                        title={currentQuestion.question}
                        description={currentQuestion.explanation || ""}
                        code={answers[currentQuestion._id] ?? (currentQuestion.templateCode || "def solve():\n    pass")}
                        language={currentQuestion.languageId?.monaco_identifier || "python"}
                        languageId={currentQuestion.languageId?.judge0_id || 71}
                        testCases={currentQuestion.testCases || []}
                        problemId={currentQuestion._id}
                        skillId={rawSkillId}
                        onChange={handleUpdateAnswer}
                        onNext={handleNext}
                        onBack={handleBack}
                        isFirst={isFirst}
                        isLast={isLast}
                    />
                ) : (
                    <ChoiceQuestion
                        data={{
                            id: currentQuestion._id,
                            title: currentQuestion.question,
                            description: currentQuestion.explanation || "",
                            options: currentQuestion.choices ?? []
                        }}
                        selected={answers[currentQuestion._id] ?? null}
                        onChange={handleUpdateAnswer}
                        onNext={handleNext}
                        onBack={handleBack}
                        isFirst={isFirst}
                        isLast={isLast}
                    />
                )}
            </div>
        </div>
    );
}