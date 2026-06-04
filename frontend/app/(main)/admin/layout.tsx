"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { verifyAdminAccess } from "@/lib/verify-admin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "allowed">("loading");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const result = await verifyAdminAccess();

      if (cancelled) return;

      if (result.ok) {
        setStatus("allowed");
        return;
      }

      if (result.reason === "unauthenticated") {
        router.replace("/signin");
      } else {
        router.replace("/explore");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (status === "loading") {
    return (
      <div className="fixed inset-0 z-[9999] bg-canvas flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border-subtle border-t-brand-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
