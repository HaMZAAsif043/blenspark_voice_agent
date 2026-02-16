import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BlenSpark - Intelligent Voice Solutions",
  description: "Modern Voice Agent & Restaurant Dashboard powered by BlenSpark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-white/30 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-xl font-bold tracking-tight text-sage-500">
              Blen<span className="text-accent">Spark</span>
            </Link>
            <div className="flex gap-8 text-sm font-medium text-sage-700">
              <Link href="/agent" className="hover:text-sage-500 transition-colors">Voice Agent</Link>
              <Link href="/dashboard" className="hover:text-sage-500 transition-colors">Dashboard</Link>
            </div>
          </div>
        </nav>
        <main className="pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}
