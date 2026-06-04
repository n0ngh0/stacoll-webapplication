"use client";
import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, ArrowRight, Loader2, CircleAlert } from "lucide-react";
import { useRouter } from "next/navigation";

// Google SVG Icon
function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
  );
}

export default function SignInPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            const res = await fetch(`${apiUrl}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                if (data.message === "Please verify your email first") {
                    sessionStorage.setItem("signupEmail", formData.email);
                    router.push("/verify-otp");
                    return;
                }
                throw new Error(data.message || "Invalid credentials");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
            document.cookie = `user=${JSON.stringify(data.user)}; path=/; max-age=86400; SameSite=Lax`;

            if (data.user.role === "admin") {
                window.location.href = "/admin";
            } else {
                window.location.href = "/explore";
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        setIsGoogleLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        window.location.href = `${apiUrl}/auth/google`;
    };

    return (
        <div className="flex-1 flex flex-col justify-center relative overflow-hidden bg-canvas py-8 px-4 sm:px-6 lg:px-8">
            <main className="w-full max-w-md mx-auto animate-in fade-in zoom-in-95 duration-500 z-10">

                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black tracking-tight mb-3">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-greenui to-brand-secondary">
                            Welcome back
                        </span>
                    </h1>
                    <p className="text-text-muted text-sm font-medium uppercase tracking-widest opacity-80">
                        Please enter your details to sign in
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#eaeaea]">
                    {error && (
                        <div className="w-full bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 text-center text-sm font-medium flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
                            <CircleAlert size={18} />{error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-bold text-text-main mb-2 ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                                    <Mail width={18} height={18} />
                                </div>
                                <input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    type="email"
                                    placeholder="name@example.com"
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-text-main bg-canvas border border-border-subtle focus:bg-white focus:outline-none focus:border-greenui focus:ring-4 focus:ring-greenui/10 transition-all duration-300"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5 ml-1 mr-1">
                                <label className="block text-sm font-bold text-[#1a1a1a]">Password</label>
                                <Link href="/forgot-password" className="text-sm font-semibold text-brand-secondary hover:text-brand-secondary-hover hover:underline transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                                    <Lock width={18} height={18} />
                                </div>
                                <input
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-text-main bg-canvas border border-border-subtle focus:bg-white focus:outline-none focus:border-greenui focus:ring-4 focus:ring-greenui/10 transition-all duration-300"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || isGoogleLoading}
                            id="email-signin-btn"
                            className="mt-2 w-full flex items-center justify-center gap-2 bg-greenui text-text-main hover:brightness-105 disabled:opacity-50 font-extrabold py-4 px-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 width={20} height={20} className="animate-spin text-text-main" />
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    Log In
                                    <ArrowRight width={18} height={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mt-5">
                        <div className="flex-1 h-px bg-[#eaeaea]" />
                        <span className="text-[#aaa] text-xs font-semibold tracking-widest uppercase">or</span>
                        <div className="flex-1 h-px bg-[#eaeaea]" />
                    </div>

                    {/* Google Sign In Button */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading || isLoading}
                        id="google-signin-btn"
                        className="mt-4 w-full flex items-center justify-center gap-3 bg-white border border-[#dadce0] hover:bg-gray-50 text-[#3c4043] font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
                    >
                        {isGoogleLoading ? (
                            <Loader2 size={20} className="animate-spin text-gray-500" />
                        ) : (
                            <GoogleIcon />
                        )}
                        {isGoogleLoading ? "Redirecting to Google..." : "Continue with Google"}
                    </button>
                </div>

                {/* Footer Section */}
                <div className="mt-8 text-center flex items-center justify-center gap-2">
                    <p className="text-text-muted text-sm">Don&apos;t have an account?</p>
                    <Link href="/signup" className="text-brand-secondary text-sm font-bold hover:underline hover:text-brand-secondary-hover transition-all">
                        Sign Up
                    </Link>
                </div>

            </main>
        </div>
    )
}