import { ExportProvider } from "@/components/providers/export-context";

export default function ExportLayout({ children }: { children: React.ReactNode }) {
  return <ExportProvider>{children}</ExportProvider>;
}
