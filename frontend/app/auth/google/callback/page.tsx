"use client";
import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

export default function GoogleCallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const userParam = params.get("user");
      const errorParam = params.get("error");

      if (errorParam) {
        if (errorParam === "google_auth_cancelled") {
          setError("Google sign-in was cancelled.");
        } else {
          setError("Google sign-in failed. Please try again.");
        }
        return;
      }

      if (!token || !userParam) {
        setError("Authentication failed: Missing token or user data.");
        return;
      }

      const user = JSON.parse(decodeURIComponent(userParam));

      // เก็บ token และ user ใน localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // เก็บใน cookie สำหรับ middleware
      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `user=${JSON.stringify(user)}; path=/; max-age=86400; SameSite=Lax`;

      // Redirect ไปหน้าที่เหมาะสม
      if (user.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/explore";
      }
    } catch (err) {
      console.error("Google callback error:", err);
      setError("Something went wrong during sign-in. Please try again.");
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
        <div className="bg-white rounded-3xl p-10 shadow-lg border border-[#eaeaea] max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-text-main mb-2">Sign-in Failed</h1>
          <p className="text-text-muted text-sm mb-6">{error}</p>
          <a
            href="/signin"
            className="inline-block w-full bg-greenui text-text-main font-bold py-3 px-6 rounded-xl hover:brightness-105 transition-all"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="text-center">
        <div className="w-16 h-16 bg-greenui/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <Loader2 className="w-8 h-8 text-greenui animate-spin" />
        </div>
        <h1 className="text-xl font-bold text-text-main mb-2">Signing you in...</h1>
        <p className="text-text-muted text-sm">Please wait while we verify your Google account.</p>
      </div>
    </div>
  );
}
