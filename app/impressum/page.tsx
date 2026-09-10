import type { Metadata } from "next";
import { fullAddress, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum und Anbieterkennzeichnung von HF E-Autos.",
  alternates: { canonical: "/impressum" },
  robots: { index: true, follow: false },
};

export default function ImpressumPage() {
  return (
    <div className="mx-auto max-w-[720px] px-6 pb-24 pt-28 lg:px-10">
      <h1 className="text-[length:var(--text-h2)] font-medium leading-[var(--text-h2--line-height)]">
        Impressum
      </h1>

      <div className="mt-10 space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="font-medium">Angaben gemäß § 5 DDG</h2>
          <p className="mt-2 text-[var(--color-muted)]">
            {site.legalName}
            <br />
            Inhaber: {site.owner}
            <br />
            {site.address.street}
            <br />
            {site.address.zip} {site.address.city}
            <br />
            {site.address.country}
          </p>
        </section>

        <section>
          <h2 className="font-medium">Kontakt</h2>
          <p className="mt-2 text-[var(--color-muted)]">
            Telefon:{" "}
            <a href={`tel:${site.phone.tel}`} className="underline underline-offset-4">
              {site.phone.display}
            </a>
            <br />
            E-Mail:{" "}
            <a href={`mailto:${site.email}`} className="underline underline-offset-4">
              {site.email}
            </a>
          </p>
        </section>

        <section>
          <h2 className="font-medium">Umsatzsteuer-Identifikationsnummer</h2>
          <p className="mt-2 text-[var(--color-muted)]">
            Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:{" "}
            {site.impressum.ustId}
          </p>
        </section>

        <section>
          <h2 className="font-medium">
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
          </h2>
          <p className="mt-2 text-[var(--color-muted)]">
            {site.impressum.responsible}
            <br />
            {fullAddress()}
          </p>
        </section>

        <section>
          <h2 className="font-medium">EU-Streitschlichtung</h2>
          <p className="mt-2 text-[var(--color-muted)]">
            Die Europäische Kommission stellt eine Plattform zur
            Online-Streitbeilegung (OS) bereit:{" "}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
            . Unsere E-Mail-Adresse finden Sie oben im Impressum.
          </p>
          <p className="mt-2 text-[var(--color-muted)]">
            Wir sind nicht bereit und nicht verpflichtet, an
            Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
            teilzunehmen.
          </p>
        </section>

        <p className="text-xs text-[var(--color-muted)]">
          Hinweis: Bitte ergänzen bzw. prüfen Sie die mit «…» markierten Angaben
          (z. B. USt-IdNr.) vor Veröffentlichung.
        </p>
      </div>
    </div>
  );
}
