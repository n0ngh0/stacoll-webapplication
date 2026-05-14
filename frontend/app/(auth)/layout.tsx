import PublicNav from "@/components/layouts/public-nav";
import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "STACOLL - The World's Leading Skill Wallet",
  description: "Evaluate your skills, discover gaps, and collect verified badges to build your standout tech resume.",
  keywords: ["Skill Assessment", "Resume Builder", "Tech Skills", "Developer Portfolio"],
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicNav />
      <main className="flex-grow flex flex-col">{children}</main>
    </>
  );
}