"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
        throw new Error(data.message || "Invalid credentials");
      }

      // Store token locally
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Store in cookies for Middleware
      document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `user=${JSON.stringify(data.user)}; path=/; max-age=86400; SameSite=Lax`;
      // Redirect user to the dashboard or home
      window.location.href = "/explore";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md flex flex-col items-center">

          {/* Login Card */}
          <div className="bg-[#19c3af] w-full rounded-3xl p-8 shadow-lg flex flex-col items-center relative">
            <h1 className="text-white text-4xl font-bold mb-8 drop-shadow-md">Log In</h1>
            
            {error && <div className="w-full bg-red-100 text-red-600 p-3 rounded-xl mb-4 text-center text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                type="email"
                placeholder="Email"
                className="w-full px-5 py-3.5 rounded-full text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                type="password"
                placeholder="Password"
                className="w-full px-5 py-3.5 rounded-full text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              />

              <div className="text-right w-full mb-2">
                <Link href="/forgot-password" className="text-white text-sm hover:underline font-medium">
                  Forgot your password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-[200px] mx-auto bg-[#0088cc] hover:bg-[#0077b3] disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-full shadow-md transition duration-300 tracking-wide"
              >
                {isLoading ? "LOGGING IN..." : "LOG IN"}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[#0088cc] text-sm mb-1">Don't have an account?</p>
            <Link href="/signup" className="text-[#0088cc] text-lg font-bold hover:underline">
              Sign Up
            </Link>
          </div>

        </div>
      </main>
    </div>
  )
}