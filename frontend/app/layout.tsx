"use client";
import type { ReactNode } from "react";
import { Figtree } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

// Patch fetch for Client Components
if (typeof window !== 'undefined' && !(window as any).__fetchPatched) {
  (window as any).__fetchPatched = true;
  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    const customInit = init || {};
    customInit.headers = { ...customInit.headers, "ngrok-skip-browser-warning": "true" };
    return originalFetch(input, customInit);
  };
}

// Patch fetch for Server Components (SSR)
if (typeof globalThis !== 'undefined' && !(globalThis as any).__fetchPatched) {
  (globalThis as any).__fetchPatched = true;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const customInit = init || {};
    customInit.headers = { ...customInit.headers, "ngrok-skip-browser-warning": "true" };
    return originalFetch(input, customInit);
  };
}

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

  const isPublicPage = pathname === "/" || pathname === "/signin" || pathname === "/signup" || pathname === "/forgot-password" || pathname === "/verify-otp";
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
      </body>
    </html>
  );
}
