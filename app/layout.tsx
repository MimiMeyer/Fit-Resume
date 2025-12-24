import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FitResume",
  description: "AI-powered resume tailoring companion",
};

const navLinks = [
  { href: "/", label: "Overview" },
  { href: "/profile", label: "Profile" },
  { href: "/tailor-resume", label: "Tailor Resume" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} antialiased text-zinc-900`}
      >
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <div className="min-h-screen">
          <header className="border-b border-indigo-100 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 sticky top-0 z-40 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
              <Link
                href="/"
                aria-label="Go to overview"
                className="flex items-center gap-2 text-lg font-semibold tracking-tight rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 via-teal-400 to-indigo-400 text-sm font-semibold text-white shadow-sm">
                  FR
                </span>
                <span>FitResume</span>
              </Link>
              <nav
                className="flex items-center gap-4 text-sm font-medium text-zinc-700"
                aria-label="Primary"
              >
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full px-3 py-2 transition hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main id="main" className="mx-auto max-w-6xl px-6 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
