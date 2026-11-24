import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BuildGap — Verified Software Pain Points & AI Build Specs",
    template: "%s | BuildGap",
  },
  description:
    "Discover real software complaints from App Store reviews, GitHub feature requests, and Hacker News—packaged into AI-ready MVP specs for Cursor & Claude Code builders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="mt-20 border-t border-zinc-800/80 py-10 text-sm text-zinc-400">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
            <div>
              <span className="font-semibold text-zinc-100">BuildGap</span> — Real user pain points turned into AI-ready build specs.
            </div>
            <div className="flex flex-wrap gap-5">
              <Link href="/" className="hover:text-zinc-200">
                Ideas Database
              </Link>
              <Link href="/industry/productivity" className="hover:text-zinc-200">
                Industries
              </Link>
              <Link href="/complaints/evernote" className="hover:text-zinc-200">
                Complaints
              </Link>
              <Link href="/pricing" className="hover:text-zinc-200">
                Pricing
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
