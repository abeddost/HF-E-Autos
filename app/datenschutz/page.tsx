import type { Metadata } from "next";
import { fullAddress, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Informationen zur Verarbeitung personenbezogener Daten bei HF E-Autos.",
  alternates: { canonical: "/datenschutz" },
  robots: { index: true, follow: false },
};

export default function DatenschutzPage() {
  return (
    <div className="mx-auto max-w-[720px] px-6 pb-24 pt-28 lg:px-10">
      <h1 className="text-[length:var(--text-h2)] font-medium leading-[var(--text-h2--line-height)]">
        Datenschutzerklärung
      </h1>

      <p className="mt-6 rounded-md bg-[var(--color-bg-alt)] px-4 py-3 text-xs text-[var(--color-muted)]">
        Diese Datenschutzerklärung ist eine Vorlage und muss vor
        Veröffentlichung anwaltlich bzw. durch den Verantwortlichen final
        geprüft und ggf. an die tatsächlich eingesetzten Dienste angepasst
        werden.
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-[var(--color-muted)]">
        <section>
          <h2 className="font-medium text-[var(--color-fg)]">
            1. Verantwortlicher
          </h2>
          <p className="mt-2">
            {site.legalName}, Inhaber {site.owner}, {fullAddress()}. E-Mail:{" "}
            <a href={`mailto:${site.email}`} className="underline underline-offset-4">
              {site.email}
            </a>
            , Telefon: {site.phone.display}.
          </p>
        </section>

        <section>
          <h2 className="font-medium text-[var(--color-fg)]">
            2. Aufruf der Website und Server-Logs
          </h2>
          <p className="mt-2">
            Beim Aufruf dieser Website werden durch den Hosting-Anbieter
            (Vercel Inc.) automatisch Informationen wie IP-Adresse, Datum und
            Uhrzeit des Zugriffs, aufgerufene Seite und übertragene Datenmenge
            verarbeitet. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO
            (berechtigtes Interesse an einem sicheren, stabilen Betrieb).
          </p>
        </section>

        <section>
          <h2 className="font-medium text-[var(--color-fg)]">
            3. Kontaktaufnahme
          </h2>
          <p className="mt-2">
            Wenn Sie uns über das Kontaktformular, per E-Mail, Telefon oder
            WhatsApp kontaktieren, verarbeiten wir die von Ihnen angegebenen
            Daten (Name, Kontaktdaten, Nachricht, ggf. Fahrzeugbezug) zur
            Bearbeitung Ihrer Anfrage. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b
            bzw. lit. f DSGVO. Nachrichten aus dem Kontaktformular werden über
            den Dienstleister Resend (Resend, Inc., USA) per E-Mail an uns
            zugestellt. Die Daten werden gelöscht, sobald sie für die
            Bearbeitung nicht mehr erforderlich sind und keine gesetzlichen
            Aufbewahrungsfristen entgegenstehen.
          </p>
        </section>

        <section>
          <h2 className="font-medium text-[var(--color-fg)]">
            4. Fahrzeugdaten und Bilder
          </h2>
          <p className="mt-2">
            Die auf dieser Website angezeigten Fahrzeuginformationen und
            -bilder stammen aus unserem Bestand bei der mobile.de GmbH und
            werden einmal täglich automatisch aktualisiert. Bilder können von
            Servern der mobile.de-Infrastruktur ausgeliefert werden.
          </p>
        </section>

        <section>
          <h2 className="font-medium text-[var(--color-fg)]">
            5. Karten / Standort
          </h2>
          <p className="mt-2">
            Auf der Kontaktseite binden wir eine Karte von Google Maps (Google
            Ireland Ltd.) ein. Beim Laden der Karte wird Ihre IP-Adresse an
            Google übermittelt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
          </p>
        </section>

        <section>
          <h2 className="font-medium text-[var(--color-fg)]">6. Ihre Rechte</h2>
          <p className="mt-2">
            Sie haben das Recht auf Auskunft, Berichtigung, Löschung,
            Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch
            sowie ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde.
            Wenden Sie sich hierzu an die oben genannten Kontaktdaten.
          </p>
        </section>
      </div>
    </div>
  );
}
