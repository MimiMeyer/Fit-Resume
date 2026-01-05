"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import appIcon from "../icon.png";

const navLinks = [
  { href: "/", label: "Overview" },
  { href: "/profile", label: "Profile" },
  { href: "/tailor-resume", label: "Tailor Resume" },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [openForPath, setOpenForPath] = useState<string | null>(null);
  const open = openForPath === pathname;
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const menu = menuRef.current;
      const button = buttonRef.current;
      if (
        (menu && e.target instanceof Node && menu.contains(e.target)) ||
        (button && e.target instanceof Node && button.contains(e.target))
      ) {
        return;
      }
      setOpenForPath(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpenForPath(null);
      buttonRef.current?.focus();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const linkClass = (href: string) => {
    const active = isActivePath(pathname, href);
    return [
      "rounded-full px-3 py-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
      active ? "bg-indigo-100 text-indigo-900" : "text-zinc-700 hover:bg-indigo-50",
    ].join(" ");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-indigo-100 bg-white/80 shadow-[0_2px_12px_rgba(0,0,0,0.05)] backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          aria-label="Go to overview"
          className="flex min-w-0 items-center gap-2 rounded text-lg font-semibold tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          <Image
            src={appIcon}
            alt=""
            aria-hidden
            width={36}
            height={36}
            priority
            className="h-9 w-9 shrink-0 rounded-lg object-contain shadow-sm ring-1 ring-black/5"
          />
          <span className="truncate">FitResume</span>
        </Link>

        <nav className="hidden items-center gap-2 text-sm font-medium sm:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="sm:hidden">
          <button
            ref={buttonRef}
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpenForPath((prev) => (prev === pathname ? null : pathname))}
          >
            <span aria-hidden className="grid gap-1">
              <span className="block h-0.5 w-5 rounded bg-zinc-700" />
              <span className="block h-0.5 w-5 rounded bg-zinc-700" />
              <span className="block h-0.5 w-5 rounded bg-zinc-700" />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          ref={menuRef}
          className="border-t border-indigo-100 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/85 sm:hidden"
          role="dialog"
          aria-label="Navigation menu"
        >
          <div className="mx-auto grid max-w-6xl gap-2 text-sm font-semibold">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkClass(link.href)}
                onClick={() => setOpenForPath(null)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
