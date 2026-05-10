import PublicNav from "@/components/layouts/public-nav";
import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "STACOLL - The World's Leading Skill Wallet",
  description: "Evaluate your skills, discover gaps, and collect verified badges to build your standout tech resume.",
  keywords: ["Skill Assessment", "Resume Builder", "Tech Skills", "Developer Portfolio"],
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicNav />
      <main className="force-light">{children}</main>
    </>
  );
}