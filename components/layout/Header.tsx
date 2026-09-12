"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close overlays on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // lock body scroll while an overlay is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const solid = !isHome || scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        solid
          ? "border-b border-[var(--color-line)] bg-white/95 text-[var(--color-fg)] backdrop-blur"
          : "border-b border-transparent text-white",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-10">
        <Link href="/" aria-label="Startseite" className="shrink-0">
          <Logo light={!solid} />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium tracking-[0.02em] transition-opacity hover:opacity-70"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${site.phone.tel}`}
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-opacity hover:opacity-70 sm:inline-flex"
            aria-label={`Anrufen: ${site.phone.display}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.6a1 1 0 01-.25 1L6.6 10.8z"
                fill="currentColor"
              />
            </svg>
            <span className="hidden xl:inline">{site.phone.display}</span>
          </a>

          <button
            type="button"
            className="-mr-2 inline-flex items-center gap-2 p-2 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Menü öffnen"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M3 6h18M3 12h18M3 18h18"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
