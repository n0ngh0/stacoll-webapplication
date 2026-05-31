"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Shield, Trash2, Settings } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-canvas animate-pulse transition-colors duration-300"></div>
    );
  }

  if (!mounted) return null;
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-16 transition-colors duration-300">
      {/* --- Header --- */}
      <div className="pb-6 border-b border-border-subtle transition-colors">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-main transition-colors">Settings</h1>
      </div>

      {/* --- Main Settings Container --- */}
      <div className="divide-y divide-border-subtle transition-colors">

        {/* Appearance Section */}
        <section className="py-8 md:py-10 flex flex-col md:flex-row md:items-start gap-6 md:gap-12">
          <div className="w-full md:w-1/3">
            <h2 className="text-base font-semibold text-text-main transition-colors">Appearance</h2>
            <p className="text-sm text-text-muted mt-1.5 leading-relaxed transition-colors">
              Customize how Stacoll looks on your device. Choose between light and dark mode.
            </p>
          </div>

          <div className="w-full md:w-2/3 md:pl-4">
            <div className="inline-flex bg-surface p-1.5 rounded-xl shadow-sm transition-colors">
              <button
                onClick={() => setTheme("light")}
                className={`cursor-pointer flex items-center gap-2.5 px-6 py-2 rounded-lg text-sm font-semibold transition-all ${theme === 'light'
                  ? "bg-canvas text-text-main shadow-sm border border-border-subtle"
                  : "text-text-muted hover:text-text-main border border-transparent"
                  }`}
              >
                <Sun size={16} /> Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`cursor-pointer flex items-center gap-2.5 px-6 py-2 rounded-lg text-sm font-semibold transition-all ${theme === 'dark'
                  ? "bg-canvas text-text-main shadow-sm border border-border-subtle"
                  : "text-text-muted hover:text-text-main border border-transparent"
                  }`}
              >
                <Moon size={16} /> Dark
              </button>
            </div>
          </div>
        </section>

        {/* Password & Security Section*/}
        <section className="py-8 md:py-10 flex flex-col md:flex-row md:items-start gap-6 md:gap-12">
          <div className="w-full md:w-1/3">
            <h2 className="text-base font-semibold text-text-main transition-colors">Password</h2>
            <p className="text-sm text-text-muted mt-1.5 leading-relaxed transition-colors">
              Update your password associated with your account. We recommend using a strong password.
            </p>
          </div>

          <div className="w-full md:w-2/3 md:pl-4 max-w-lg space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-main mb-2 transition-colors">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-surface text-text-main border border-border-subtle focus:border-greenui focus:ring-2 focus:ring-greenui/20 outline-none transition-all placeholder:text-text-muted/50 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-2 transition-colors">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-surface text-text-main border border-border-subtle focus:border-greenui focus:ring-2 focus:ring-greenui/20 outline-none transition-all placeholder:text-text-muted/50 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-2 transition-colors">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-surface text-text-main border border-border-subtle focus:border-greenui focus:ring-2 focus:ring-greenui/20 outline-none transition-all placeholder:text-text-muted/50 shadow-sm"
              />
            </div>
            <div className="pt-2">
              <button className="bg-greenbutton text-white dark:text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-greenbutton/90 transition-all shadow-sm cursor-pointer flex items-center gap-2">
                Change Password
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone Section*/}
        <section className="py-8 md:py-10 flex flex-col md:flex-row md:items-start gap-6 md:gap-12">
          <div className="w-full md:w-1/3">
            <h2 className="text-base font-semibold text-red-500 transition-colors">Delete Account</h2>
            <p className="text-sm text-text-muted mt-1.5 leading-relaxed transition-colors">
              No longer want to use our service? You can delete your account here. This action is not reversible.
            </p>
          </div>

          <div className="w-full md:w-2/3 md:pl-4 flex items-start">
            <button className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center gap-2 shadow-sm">
              <Trash2 size={16} /> Delete account
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}