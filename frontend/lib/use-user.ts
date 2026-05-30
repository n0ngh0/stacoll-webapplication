"use client";
import { useState, useEffect } from "react";
import { SessionUser } from "../types/user";

export function useUser() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyRole = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${apiUrl}/profile/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok && data.success && data.user) {
          const freshUser = {
            id: data.user._id,
            username: data.user.username,
            email: data.user.email,
            role: data.user.role,
            imgUrl: data.user.imgUrl
          };
          setUser(freshUser);
          setIsAdmin(freshUser.role === "admin");
        } else {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/";
          }
        }
      } catch (e) {
        console.error("Failed to verify user role from API", e);
      } finally {
        setIsLoading(false);
      }
    };

    verifyRole();
  }, []);

  return { user, isAdmin, isLoading };
}