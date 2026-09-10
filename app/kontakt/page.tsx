import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { Reveal } from "@/components/ui/Reveal";
import { fullAddress, mapsLink, site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontakt",
  description: `Kontakt zu ${site.name} in ${site.address.city} – Telefon, WhatsApp, E-Mail und Anfahrt.`,
  alternates: { canonical: "/kontakt" },
};

export default function ContactPage() {
  const mapQuery = encodeURIComponent(fullAddress());

  return (
    <div className="pt-24">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <Reveal>
          <p className="label-caps text-[var(--color-muted)]">Kontakt</p>
          <h1 className="mt-3 text-[length:var(--text-h2)] font-medium leading-[var(--text-h2--line-height)]">
            Sprechen Sie mit uns
          </h1>
          <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
            Ob Probefahrt, Finanzierung oder eine Frage zu einem bestimmten
            Fahrzeug – wir sind für Sie da.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-12 pb-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <Reveal>
            <ContactForm />
          </Reveal>

          <Reveal delay={80} className="flex flex-col gap-8">
            <div>
              <h2 className="label-caps text-[var(--color-muted)]">Direkt erreichbar</h2>
              <div className="mt-4 flex flex-col gap-3">
                <a
                  href={`tel:${site.phone.tel}`}
                  className="rounded-full bg-[var(--color-accent)] px-6 py-3.5 text-center text-sm font-medium uppercase tracking-[0.06em] text-white hover:bg-[var(--color-accent-hover)]"
                >
                  Anrufen · {site.phone.display}
                </a>
                <a
                  href={whatsappLink(`Hallo ${site.name}, ich habe eine Frage.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[var(--color-fg)]/25 px-6 py-3.5 text-center text-sm font-medium uppercase tracking-[0.06em] hover:bg-[var(--color-bg-alt)]"
                >
                  WhatsApp
                </a>
                <a
                  href={`mailto:${site.email}`}
                  className="rounded-full border border-[var(--color-fg)]/25 px-6 py-3.5 text-center text-sm font-medium uppercase tracking-[0.06em] hover:bg-[var(--color-bg-alt)]"
                >
                  {site.email}
                </a>
              </div>
            </div>

            <div>
              <h2 className="label-caps text-[var(--color-muted)]">Adresse</h2>
              <address className="mt-4 text-sm not-italic leading-relaxed">
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
                  className="mt-1 inline-block underline underline-offset-4"
                >
                  Route planen
                </a>
              </address>
            </div>

            <div>
              <h2 className="label-caps text-[var(--color-muted)]">Öffnungszeiten</h2>
              <dl className="mt-4 divide-y divide-[var(--color-line)] border-y border-[var(--color-line)] text-sm">
                {site.openingHours.map((oh) => (
                  <div key={oh.days} className="flex justify-between py-3">
                    <dt className="text-[var(--color-muted)]">{oh.days}</dt>
                    <dd className="font-medium">{oh.hours}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="overflow-hidden rounded-xl border border-[var(--color-line)]">
              <iframe
                title="Standort auf der Karte"
                width="100%"
                height="260"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              />
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
