import PublicNav from "@/components/layouts/public-nav";
import { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicNav />
      <main>{children}</main>
    </>
  );
}