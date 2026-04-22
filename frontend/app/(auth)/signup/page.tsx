"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Something went wrong during registration");
      }

      // Registration successful
      router.push("/signin");
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
          
          {/* Sign Up Card */}
          <div className="bg-[#19c3af] w-full rounded-[2rem] p-10 shadow-xl flex flex-col items-center">
            <h1 className="text-white text-4xl font-bold mb-8">Sign Up</h1>
            
            {error && <div className="w-full bg-red-100 text-red-600 p-3 rounded-xl mb-4 text-center text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              {/* Username Input */}
              <input 
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                type="text" 
                placeholder="Username" 
                className="w-full px-6 py-4 rounded-full text-gray-700 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
              />
              
              {/* Email Input */}
              <input 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                type="email" 
                placeholder="Email" 
                className="w-full px-6 py-4 rounded-full text-gray-700 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
              />

              {/* Password Input */}
              <input 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                type="password" 
                placeholder="Password" 
                className="w-full px-6 py-4 rounded-full text-gray-700 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
              />

              {/* Confirm Password Input */}
              <input 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                type="password" 
                placeholder="Confirm password" 
                className="w-full px-6 py-4 rounded-full text-gray-700 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
              />

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isLoading}
                className="mt-4 w-[180px] mx-auto bg-[var(--bluebutton)] hover:bg-[#0077b3] disabled:bg-gray-400 text-white font-bold py-3.5 rounded-full shadow-lg transform active:scale-95 transition-all duration-200 tracking-wide"
              >
                {isLoading ? "SUBMITTING..." : "SUBMIT"}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center flex flex-col items-center">
            <p className="text-[#0088cc] text-sm mb-1">Already have an account?</p>
            <Link href="/signin" className="text-[#0088cc] text-sm font-medium hover:underline flex items-center gap-1 opacity-90">
            <span className="font-bold text-lg">Sign In</span>
            </Link>
          </div>

        </div>
      </main>
    </div>
  )
}