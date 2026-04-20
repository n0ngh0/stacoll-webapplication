import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layouts/navigation"
import Footer from "@/components/layouts/footer"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stacoll Web Application",
  description: "Stacoll Skill-Wallet Web Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
