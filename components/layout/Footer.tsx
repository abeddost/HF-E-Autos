import Link from "next/link";
import { fullAddress, mapsLink, site } from "@/lib/site";
import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-bg-dark)] text-white/70">
      <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              {site.tagline}. Geprüfte Elektro- und Plug-in-Hybrid-Gebrauchtwagen
              in Wiesbaden.
            </p>
            <address className="mt-6 text-sm not-italic leading-relaxed">
              {site.legalName}
              <br />
              {site.address.street}
              <br />
              {site.address.zip} {site.address.city}
              <br />
              <a
                href={mapsLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-white"
              >
                Route planen
              </a>
            </address>
          </div>

          {site.footerColumns.map((col) => (
            <div key={col.title}>
              <p className="label-caps text-white/50">{col.title}</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.legalName}. Alle Rechte vorbehalten.
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <a href={`tel:${site.phone.tel}`} className="hover:text-white">
              {site.phone.display}
            </a>
            <a href={`mailto:${site.email}`} className="hover:text-white">
              {site.email}
            </a>
            <span className="text-white/40">
              Bestand wird täglich von mobile.de aktualisiert
            </span>
          </p>
        </div>
        <p className="sr-only">{fullAddress()}</p>
      </div>
    </footer>
  );
}
