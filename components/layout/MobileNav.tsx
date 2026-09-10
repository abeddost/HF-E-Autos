"use client";

import Link from "next/link";
import { useEffect } from "react";
import { site, whatsappLink } from "@/lib/site";
import { Logo } from "./Logo";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[60] bg-white transition-opacity duration-300 lg:hidden ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
    >
      <div className="flex h-16 items-center justify-between border-b border-[var(--color-line)] px-6">
        <Logo />
        <button
          type="button"
          onClick={onClose}
          aria-label="Menü schließen"
          className="-mr-2 p-2"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <nav className="flex flex-col gap-1 overflow-y-auto px-6 py-8">
        {site.nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="border-b border-[var(--color-line)] py-4 text-2xl font-medium"
          >
            {item.label}
          </Link>
        ))}

        <p className="label-caps mt-8 text-[var(--color-muted)]">Bestand</p>
        <div className="mt-3 flex flex-col gap-1">
          {[
            ...site.megaMenu.primary,
            ...site.megaMenu.bodyStyles,
          ].map((cat) => (
            <Link
              key={`${cat.label}-${cat.query}`}
              href={`/unsere-angebote${cat.query}`}
              onClick={onClose}
              className="py-2 text-lg text-[var(--color-muted)]"
            >
              {cat.label}
            </Link>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3">
          <a
            href={`tel:${site.phone.tel}`}
            className="rounded-full bg-[var(--color-fg)] px-6 py-3 text-center text-sm font-medium uppercase tracking-[0.06em] text-white"
          >
            {site.phone.display}
          </a>
          <a
            href={whatsappLink(`Hallo ${site.name}, ich habe eine Frage zu Ihren Fahrzeugen.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[var(--color-fg)]/25 px-6 py-3 text-center text-sm font-medium uppercase tracking-[0.06em]"
          >
            WhatsApp
          </a>
        </div>
      </nav>
    </div>
  );
}
