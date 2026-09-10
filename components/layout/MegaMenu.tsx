"use client";

import Link from "next/link";
import { useEffect } from "react";
import { site } from "@/lib/site";

interface MegaMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MegaMenu({ open, onClose }: MegaMenuProps) {
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
      className={`absolute inset-x-0 top-full origin-top border-b border-[var(--color-line)] bg-white transition-all duration-300 ${
        open
          ? "pointer-events-auto visible translate-y-0 opacity-100"
          : "pointer-events-none invisible -translate-y-2 opacity-0"
      }`}
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-3 lg:px-8">
        <div>
          <p className="label-caps text-[var(--color-muted)]">Bestand</p>
          <ul className="mt-5 space-y-3">
            {site.megaMenu.primary.map((cat) => (
              <li key={cat.label}>
                <Link
                  href={`/unsere-angebote${cat.query}`}
                  onClick={onClose}
                  className="group flex items-baseline justify-between gap-4 text-lg font-medium hover:text-[var(--color-accent)]"
                >
                  <span>{cat.label}</span>
                  {cat.description ? (
                    <span className="text-sm font-normal text-[var(--color-muted)]">
                      {cat.description}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="label-caps text-[var(--color-muted)]">Karosserie</p>
          <ul className="mt-5 space-y-3">
            {site.megaMenu.bodyStyles.map((cat) => (
              <li key={cat.label}>
                <Link
                  href={`/unsere-angebote${cat.query}`}
                  onClick={onClose}
                  className="text-lg font-medium hover:text-[var(--color-accent)]"
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="label-caps text-[var(--color-muted)]">Preis</p>
          <ul className="mt-5 space-y-3">
            {site.megaMenu.priceBuckets.map((cat) => (
              <li key={cat.label}>
                <Link
                  href={`/unsere-angebote${cat.query}`}
                  onClick={onClose}
                  className="text-lg font-medium hover:text-[var(--color-accent)]"
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/unsere-angebote"
            onClick={onClose}
            className="mt-6 inline-block text-sm font-medium text-[var(--color-accent)] underline underline-offset-4"
          >
            Alle Fahrzeuge ansehen
          </Link>
        </div>
      </div>
    </div>
  );
}
