"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Loader2, ArrowRight, CircleAlert } from "lucide-react";

export default function VerifyOTPPage() {
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(59);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // ฟังก์ชันจัดการการนับถอยหลัง
    useEffect(() => {
        const interval = setInterval(() => {
            if (timer > 0) setTimer(timer - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timer]);

    // ฟังก์ชันจัดการการพิมพ์รหัส OTP
    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        if (element.value !== "" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // ฟังก์ชันจัดการการกด Backspace
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const otpCode = otp.join("");

        if (otpCode.length < 6) {
            return setError("Please enter the full 6-digit code.");
        }

        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            window.location.href = "/signin";
        } catch (err: any) {
            setError("Invalid OTP code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = () => {
        if (timer === 0) {
            setTimer(59);
            // ยิง API ส่ง OTP ใหม่
        }
    };

    return (
        <div className="flex-1 flex flex-col justify-center relative overflow-hidden bg-canvas py-8 px-4 sm:px-6 lg:px-8">
            <main className="w-full max-w-md mx-auto animate-in fade-in zoom-in-95 duration-500 z-10">

                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black tracking-tight mb-3">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-greenui to-brand-secondary">
                            Verify OTP
                        </span>
                    </h1>
                    <p className="text-text-muted text-sm font-medium uppercase tracking-widest opacity-80 leading-relaxed">
                        We've sent a code to your email
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#eaeaea]">
                    {error && (
                        <div className="w-full bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-8 text-center text-sm font-medium flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
                            <CircleAlert size={18} />{error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                        
                        {/* OTP Inputs Group */}
                        <div className="flex justify-between gap-2">
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength={1}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    value={data}
                                    onChange={(e) => handleChange(e.target, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className="w-full h-14 sm:h-16 text-center text-xl font-bold rounded-xl border border-border-subtle bg-canvas focus:bg-white focus:border-greenui focus:ring-4 focus:ring-greenui/10 transition-all outline-none"
                                />
                            ))}
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-text-muted mb-2 font-medium">Didn't receive the code?</p>
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={timer > 0}
                                className={`text-sm font-bold transition-all ${
                                    timer > 0 ? "text-text-muted opacity-50" : "text-brand-secondary hover:text-brand-secondary-hover cursor-pointer"
                                }`}
                            >
                                {timer > 0 ? `Resend code in ${timer}s` : "Resend code now"}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-greenui text-text-main hover:brightness-105 disabled:opacity-50 font-extrabold py-4 px-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 width={20} height={20} className="animate-spin text-text-main" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    Verify Account
                                    <ArrowRight width={18} height={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Section */}
                <div className="mt-8 text-center">
                    <Link 
                        href="/signin" 
                        className="text-brand-secondary text-sm font-bold hover:underline hover:text-brand-secondary-hover transition-all inline-flex items-center gap-2"
                    >
                        <ArrowLeft size={16} /> Back to Sign In
                    </Link>
                </div>

            </main>
        </div>
    );
}