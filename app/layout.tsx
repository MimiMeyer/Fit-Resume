import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Career Companion",
  description: "AI-powered job search assistant",
};

const navLinks = [
  { href: "/", label: "Overview" },
  { href: "/job-search", label: "Job Search" },
  { href: "/saved-jobs", label: "Saved Jobs" },
  { href: "/about", label: "About Me" },
  { href: "/settings", label: "Settings" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} antialiased bg-white text-zinc-900`}
      >
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <div className="min-h-screen">
          <header className="border-b border-zinc-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
              <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-sm text-white">
                  CC
                </span>
                <span>Career Companion</span>
              </div>
              <nav
                className="flex items-center gap-4 text-sm font-medium text-zinc-700"
                aria-label="Primary"
              >
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded px-3 py-2 transition hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
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
