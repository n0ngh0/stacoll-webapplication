"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Lock, Loader2, CircleAlert, ArrowRight, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { validatePassword, PASSWORD_POLICY_HINT } from "@/lib/validation/password";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const linkInvalid = !email || !token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const check = validatePassword(password);
    if (!check.valid) {
      setError(check.message);
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiFetch("/auth/reset-password", {
        auth: false,
        method: "POST",
        body: JSON.stringify({ email, token, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not reset password");
      }
      setIsDone(true);
      setTimeout(() => router.push("/signin"), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center relative overflow-hidden bg-canvas py-8 px-4 sm:px-6 lg:px-8">
      <main className="w-full max-w-md mx-auto animate-in fade-in zoom-in-95 duration-500 z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tight mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-greenui to-brand-secondary">
              {isDone ? "Password updated" : "New password"}
            </span>
          </h1>
          <p className="text-text-muted text-sm font-medium uppercase tracking-widest opacity-80">
            {isDone ? "You can sign in now" : "Choose a strong password"}
          </p>
        </div>

        <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border-subtle">
          {linkInvalid ? (
            <div className="text-center">
              <p className="text-text-muted text-sm mb-6">
                This reset link is invalid or incomplete. Request a new link from the sign-in page.
              </p>
              <Link
                href="/forgot-password"
                className="text-brand-secondary text-sm font-bold hover:underline"
              >
                Request reset link
              </Link>
            </div>
          ) : isDone ? (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-greenui/10 text-greenui rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 width={32} height={32} />
              </div>
              <p className="text-text-muted text-sm">Redirecting to sign in…</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="w-full bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 text-center text-sm font-medium flex items-center justify-center gap-2">
                  <CircleAlert size={18} />
                  {error}
                </div>
              )}
              <p className="text-xs text-text-muted mb-6">{PASSWORD_POLICY_HINT}</p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-bold text-text-main mb-2 ml-1">New password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                      <Lock width={18} height={18} />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl text-text-main bg-canvas border border-border-subtle focus:bg-white focus:outline-none focus:border-greenui focus:ring-4 focus:ring-greenui/10 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-main mb-2 ml-1">Confirm password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                      <Lock width={18} height={18} />
                    </div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl text-text-main bg-canvas border border-border-subtle focus:bg-white focus:outline-none focus:border-greenui focus:ring-4 focus:ring-greenui/10 transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-greenui text-text-main hover:brightness-105 disabled:opacity-50 font-extrabold py-4 px-6 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 width={20} height={20} className="animate-spin" />
                      Updating…
                    </>
                  ) : (
                    <>
                      Update password
                      <ArrowRight width={18} height={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center bg-canvas min-h-[40vh]">
          <Loader2 className="animate-spin text-greenui" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
