import { Metadata } from "next";

export const metadata: Metadata = {
  title: "STACOLL - The World's Leading Skill Wallet",
  description: "Evaluate your skills, discover gaps, and collect verified badges to build your standout tech resume.",
  keywords: ["Skill Assessment", "Resume Builder", "Tech Skills", "Developer Portfolio"],
};

export default function AssessmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main >{children}</main>
    </>
  );
}