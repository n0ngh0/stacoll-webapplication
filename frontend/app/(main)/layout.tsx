import MemberNav from "@/components/layouts/member-nav";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "STACOLL - The World's Leading Skill Wallet",
  description: "Evaluate your skills, discover gaps, and collect verified badges to build your standout tech resume.",
  keywords: ["Skill Assessment", "Resume Builder", "Tech Skills", "Developer Portfolio"],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MemberNav />
      <main>{children}</main>
    </>
  );
}