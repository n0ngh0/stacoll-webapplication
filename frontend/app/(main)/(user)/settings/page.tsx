"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Shield, Trash2, Settings } from "lucide-react";
import Link from "next/link";
import { getToken } from "@/lib/auth-session";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => setMounted(true), []);

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.push("/signin");
    } else {
      const timer = setTimeout(() => setIsCheckingAuth(false), 100);
      return () => clearTimeout(timer);
    }
  }, [router]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPassError("Password must be at least 8 characters.");
      return;
    }

    setIsUpdatingPass(true);
    try {
      const { apiFetch } = await import("@/lib/api/client");
      const res = await apiFetch("/profile/me/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      
      if (data.success) {
        setPassSuccess("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPassError(data.message || "Failed to update password.");
      }
    } catch (err) {
      setPassError("An error occurred. Please try again.");
    } finally {
      setIsUpdatingPass(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    setIsDeleting(true);
    try {
      const { apiFetch } = await import("@/lib/api/client");
      const res = await apiFetch("/profile/me", { method: "DELETE" });
      const data = await res.json();
      
      if (data.success) {
        const { clearSession } = await import("@/lib/auth-session");
        clearSession();
        window.location.href = "/signin";
      } else {
        setDeleteError(data.message || "Failed to delete account.");
        setIsDeleting(false);
      }
    } catch (err) {
      setDeleteError("An error occurred. Please try again.");
      setIsDeleting(false);
    }
  };

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

          <div className="w-full md:w-2/3 md:pl-4 max-w-lg">
            <form onSubmit={handlePasswordChange} className="space-y-5">
              {passError && <div className="p-3 bg-red-500/10 text-red-500 text-sm font-semibold rounded-lg">{passError}</div>}
              {passSuccess && <div className="p-3 bg-greenui/10 text-emerald-600 text-sm font-semibold rounded-lg">{passSuccess}</div>}
              
              <div>
                <label className="block text-sm font-medium text-text-main mb-2 transition-colors">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface text-text-main border border-border-subtle focus:border-greenui focus:ring-2 focus:ring-greenui/20 outline-none transition-all placeholder:text-text-muted/50 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-2 transition-colors">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface text-text-main border border-border-subtle focus:border-greenui focus:ring-2 focus:ring-greenui/20 outline-none transition-all placeholder:text-text-muted/50 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-2 transition-colors">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface text-text-main border border-border-subtle focus:border-greenui focus:ring-2 focus:ring-greenui/20 outline-none transition-all placeholder:text-text-muted/50 shadow-sm"
                />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={isUpdatingPass} className="bg-greenbutton text-white dark:text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-greenbutton/90 transition-all shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50">
                  {isUpdatingPass ? "Updating..." : "Change Password"}
                </button>
              </div>
            </form>
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

          <div className="w-full md:w-2/3 md:pl-4 flex flex-col items-start">
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <Trash2 size={16} /> Delete account
            </button>
            {deleteError && <p className="text-red-500 text-sm mt-3">{deleteError}</p>}
          </div>
        </section>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface p-6 md:p-8 rounded-2xl shadow-xl border border-border-subtle max-w-[400px] w-full animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-text-main mb-3">Delete Account</h3>
            <p className="text-sm text-text-muted leading-relaxed mb-6">
              Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently delete your profile, skills, and progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button 
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-5 py-2.5 text-sm font-bold text-text-main hover:bg-surface-hover rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-5 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}