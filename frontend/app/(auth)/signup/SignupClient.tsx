"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, CheckCircle2, Loader2, ArrowRight, CircleAlert } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Registration failed");

      router.push("/signin");
    } catch (err: any) {
      setError(err.message);
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
              Create Account
            </span>
          </h1>
          <p className="text-text-muted text-sm font-medium uppercase tracking-widest opacity-80">
            Join the world's leading skill wallet
          </p>
        </div>

        {/* Sign Up Card */}
        <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#eaeaea]">
          {error && (
            <div className="w-full bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 text-center text-sm font-medium flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
              <CircleAlert size={18} />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            {/* Username */}
            <div>
              <label className="block text-sm font-bold text-text-main mb-2 ml-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                  <User width={18} height={18} />
                </div>
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="yourname"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-text-main bg-canvas border border-border-subtle focus:bg-white focus:outline-none focus:border-greenui focus:ring-4 focus:ring-greenui/10 transition-all duration-300"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-text-main mb-2 ml-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                  <Mail width={18} height={18} />
                </div>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-text-main bg-canvas border border-border-subtle focus:bg-white focus:outline-none focus:border-greenui focus:ring-4 focus:ring-greenui/10 transition-all duration-300"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-text-main mb-2 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                  <Lock width={18} height={18} />
                </div>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-text-main bg-canvas border border-border-subtle focus:bg-white focus:outline-none focus:border-greenui focus:ring-4 focus:ring-greenui/10 transition-all duration-300"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-bold text-text-main mb-2 ml-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                  <CheckCircle2 width={18} height={18} />
                </div>
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-text-main bg-canvas border border-border-subtle focus:bg-white focus:outline-none focus:border-greenui focus:ring-4 focus:ring-greenui/10 transition-all duration-300"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-greenui text-text-main hover:brightness-105 disabled:opacity-50 font-extrabold py-4 px-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 width={20} height={20} className="animate-spin text-text-main" />
                  Signing up...
                </>
              ) : (
                <>
                  Sign Up
                  <ArrowRight width={18} height={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center flex items-center justify-center gap-2">
          <p className="text-text-muted text-sm">Already have an account?</p>
          <Link href="/signin" className="text-brand-secondary text-sm font-bold hover:underline hover:text-brand-secondary-hover transition-all">
            Log In
          </Link>
        </div>
      </main>
    </div>
  );
}