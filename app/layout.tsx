import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "./components/SiteHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FitResume",
  description: "AI-powered resume tailoring companion",
};

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
          <SiteHeader />
          <main id="main" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
