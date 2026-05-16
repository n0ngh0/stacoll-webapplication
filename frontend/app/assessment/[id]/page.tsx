"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import AssessmentHeader from "@/components/layouts/assessment-header";
import CodingQuestion from "@/components/layouts/coding-question";
import ChoiceQuestion from "@/components/layouts/choice-question";

const MOCK_QUESTIONS = [
    {
        id: 1,
        type: "coding",
        title: "Two Sum",
        description: "Given an array of integers, return indices of the two numbers such that they add up to a specific target.",
        initialCode: "def solve(nums, target):\n    # Write your code here\n    pass"
    },
    {
        id: 2,
        type: "choice",
        title: "Python Memory Management",
        description: "Which of the following mechanisms does Python primarily use for automatic memory management and reclaiming unused objects?",
        options: [
            "Reference Counting & Garbage Collection",
            "Manual Memory Deallocation (free())",
            "Mark-and-Sweep Only without reference counts",
            "Python does not manage memory automatically"
        ]
    },
    {
        id: 3,
        type: "coding",
        title: "Reverse String",
        description: "Write a function that reverses a string. The input string is given as an array of characters.",
        initialCode: "def reverseString(s):\n    # Write your code here\n    pass"
    }
];

export default function ExamPage() {
    const params = useParams();
    const rawSkillId = (params?.id || "skill-assessment") as string;
    const displaySkillName = decodeURIComponent(rawSkillId as string).toUpperCase();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30 * 60);
    const [isFinished, setIsFinished] = useState(false);
    const [answers, setAnswers] = useState<{ [key: number]: any }>({});

    const currentQuestion = MOCK_QUESTIONS[currentIndex];
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === MOCK_QUESTIONS.length - 1;

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
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }));
    }, [currentQuestion.id]);

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

    if (isFinished) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-canvas p-4 text-center">
                <div className="bg-surface p-8 sm:p-10 rounded-3xl shadow-xl border border-border-subtle max-w-md w-full animate-in slide-in-from-bottom-4 fade-in duration-500">

                    <div className="w-16 h-16 bg-brand-secondary/10 text-brand-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={32} strokeWidth={2.5} />
                    </div>

                    <h2 className="text-2xl font-black text-text-main mb-3 tracking-tight">
                        Nice work!
                    </h2>
                    <p className="text-text-muted mb-8 leading-relaxed text-[15px]">
                        Your answers are in. We're calculating your results for <strong className="text-text-main font-bold">{displaySkillName}</strong>.
                    </p>

                    <button
                        onClick={() => window.location.href = `/skill/${rawSkillId}`}
                        className="w-full bg-greenui text-text-main font-extrabold py-3.5 rounded-xl hover:brightness-105 transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                        Return to skill page
                    </button>

                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col bg-canvas overflow-hidden">
            <AssessmentHeader
                current={currentIndex + 1}
                total={MOCK_QUESTIONS.length}
                title={displaySkillName}
                timeLeft={formatTime(timeLeft)}
                isUrgent={timeLeft < 300}
                skillId={rawSkillId}
            />

            <div className="flex-1 flex overflow-hidden">
                {currentQuestion.type === "coding" ? (
                    <CodingQuestion
                        title={currentQuestion.title}
                        description={currentQuestion.description}
                        code={answers[currentQuestion.id] ?? currentQuestion.initialCode}
                        onChange={handleUpdateAnswer}
                        onNext={handleNext}
                        onBack={handleBack}
                        isFirst={isFirst}
                        isLast={isLast}
                    />
                ) : (
                    <ChoiceQuestion
                        data={currentQuestion}
                        selected={answers[currentQuestion.id] ?? null}
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