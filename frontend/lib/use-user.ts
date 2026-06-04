"use client";
import { useState, useEffect } from "react";
import { SessionUser } from "../types/user";
import { apiFetch } from "@/lib/api/client";
import { clearSession, getToken } from "@/lib/auth-session";

export function useUser() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyRole = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await apiFetch("/profile/me");
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
            clearSession();
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
