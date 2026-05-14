"use client";
import type { ReactNode } from "react";
import { Figtree } from "next/font/google";
import Footer from "@/components/layouts/footer"
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPublicPage = pathname === "/" || pathname === "/signin" || pathname === "/signup" || pathname === "/forgot-password";
  return (
    <html
      lang="th"
      className={`${figtree.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col"
        data-theme={mounted && isPublicPage ? "light" : undefined}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="flex-grow flex flex-col">
            {children}
          </div>
        </ThemeProvider>
        <Footer />
      </body>
    </html>
  );
}
