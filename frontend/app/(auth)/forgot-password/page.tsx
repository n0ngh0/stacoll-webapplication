"use client";
import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowLeft, Loader2, CheckCircle2, CircleAlert, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            const res = await fetch(`${apiUrl}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            if (!res.ok) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            setIsSubmitted(true);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col justify-center relative overflow-hidden bg-canvas py-8 px-4 sm:px-6 lg:px-8">
            <main className="w-full max-w-md mx-auto animate-in fade-in zoom-in-95 duration-500 z-10">

                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black tracking-tight mb-3">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-greenui to-brand-secondary">
                            {isSubmitted ? "Check Email" : "Reset Password"}
                        </span>
                    </h1>
                    <p className="text-text-muted text-sm font-medium uppercase tracking-widest opacity-80">
                        {isSubmitted ? "Link has been sent" : "We'll send you a recovery link"}
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border-subtle">

                    {isSubmitted ? (
                        /* Success View */
                        <div className="text-center animate-in slide-in-from-bottom-4 duration-500">
                            <div className="mx-auto w-16 h-16 bg-greenui/10 text-greenui rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 width={32} height={32} />
                            </div>
                            <p className="text-text-muted text-sm mb-8 leading-relaxed">
                                We've sent a password reset link to <br />
                                <span className="font-bold text-text-main">{email}</span>
                            </p>
                            <Link
                                href="/signin"
                                className="w-full flex items-center justify-center gap-2 bg-canvas border border-border-subtle text-text-main hover:bg-white hover:border-greenui font-bold py-4 px-6 rounded-xl transition-all duration-300"
                            >
                                <ArrowLeft width={18} height={18} />
                                Back to Log In
                            </Link>
                        </div>
                    ) : (
                        /* Form View */
                        <div className="animate-in fade-in duration-300">
                            {error && (
                                <div className="w-full bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 text-center text-sm font-medium flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
                                    <CircleAlert size={18} />{error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-text-main mb-2 ml-1">Email address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                                            <Mail width={18} height={18} />
                                        </div>
                                        <input
                                            name="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            type="email"
                                            placeholder="name@example.com"
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl text-text-main bg-canvas border border-border-subtle focus:bg-white focus:outline-none focus:border-greenui focus:ring-4 focus:ring-greenui/10 transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !email}
                                    className="mt-2 w-full flex items-center justify-center gap-2 bg-greenui text-text-main hover:brightness-105 disabled:opacity-50 font-extrabold py-4 px-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 width={20} height={20} className="animate-spin text-text-main" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send Reset Link
                                            <ArrowRight width={18} height={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                {!isSubmitted && (
                    <div className="mt-8 text-center">
                        <Link
                            href="/signin"
                            className="text-brand-secondary text-sm font-bold hover:underline hover:text-brand-secondary-hover transition-all inline-flex items-center gap-2"
                        >
                            <ArrowLeft size={16} /> Back to Sign In
                        </Link>
                    </div>
                )}

            </main>
        </div>
    );
}