import MemberNav from "@/components/layouts/member-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MemberNav />
      <main>{children}</main>
    </>
  );
}