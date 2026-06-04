"use client";
import { useState, useEffect } from "react";
import { SessionUser } from "../types/user";
import { clearSession, getToken } from "@/lib/auth-session";
import { syncSessionFromApi } from "@/lib/verify-admin";

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
        const freshUser = await syncSessionFromApi();

        if (freshUser) {
          setUser(freshUser);
          setIsAdmin(freshUser.role === "admin");
        } else {
          clearSession();
          window.location.href = "/";
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
