import Link from "next/link";
import { FullBleedSection } from "@/components/sections/FullBleedSection";
import { Reveal } from "@/components/ui/Reveal";
import { FeaturedVehicleShowcase } from "@/components/vehicles/FeaturedVehicleShowcase";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { fullAddress, mapsLink, site } from "@/lib/site";
import { getFeaturedVehicles, getTopPricedVehicles } from "@/lib/vehicles";

export const revalidate = 900;

const HERO_IMG = "/images/home-hero.png";
const SERVICE_IMG = "/images/leistungen-home.png";
const LOCATION_IMG = "/images/standort-home.png";

const TRUST = [
  {
    title: "Batterie-Zertifikat",
    text: "Für jeden Stromer prüfen wir die Hochvoltbatterie und weisen die reale Restkapazität (State of Health) aus.",
  },
  {
    title: "Garantie & Gewährleistung",
    text: "Gesetzliche Gewährleistung plus optionale Anschlussgarantie von 12 bis 36 Monaten auf Wunsch.",
  },
  {
    title: "Transparente Historie",
    text: "Scheckheft, Vorbesitzer, Unfallfreiheit und Wartungsstand – dokumentiert und offen einsehbar.",
  },
];

export default async function HomePage() {
  const featured = await getFeaturedVehicles(6);
  const topPriced = await getTopPricedVehicles(3);

  return (
    <>
      <FullBleedSection
        eyebrow={site.name}
        title={site.tagline}
        subtitle="Geprüfte Elektro- und Plug-in-Hybrid-Gebrauchtwagen in Wiesbaden – mit Batterie-Check, Garantie und einem Bestand, der sich täglich aktualisiert."
        bgImage={HERO_IMG}
        priority
        primaryCta={{ label: "Fahrzeuge entdecken", href: "/unsere-angebote" }}
        secondaryCta={{ label: "Kontakt aufnehmen", href: "/kontakt" }}
        align="left"
        anchor="bottom"
      />

      {topPriced.length > 0 ? <FeaturedVehicleShowcase vehicles={topPriced} /> : null}

      {/* Trust */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 md:py-32 lg:px-10">
        <Reveal className="max-w-2xl">
          <p className="label-caps text-[var(--color-muted)]">Warum HF E-Autos</p>
          <h2 className="mt-4 text-[length:var(--text-h2)] font-medium leading-[var(--text-h2--line-height)]">
            Geprüfte Gebrauchtwagen. 100 % elektrisch.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {TRUST.map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <h3 className="text-lg font-medium">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                {item.text}
              </p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-12">
          <Link
            href="/ueber-uns"
            className="text-sm font-medium text-[var(--color-accent)] underline underline-offset-4"
          >
            Mehr über uns erfahren
          </Link>
        </Reveal>
      </section>

      <FullBleedSection
        eyebrow="Leistungen"
        title="Rundum versorgt – vom Kauf bis zur Wallbox"
        subtitle="Finanzierung und Leasing, faire Inzahlungnahme, Garantie mit Batterie-Check sowie Beratung zu Wallbox, Zulassung und Werkstatt."
        bgImage={SERVICE_IMG}
        primaryCta={{ label: "Leistungen ansehen", href: "/leistungen" }}
        align="left"
        anchor="bottom"
        minHeight="tall"
      />

      {/* Aktuelle Angebote */}
      {featured.length > 0 ? (
        <section className="mx-auto max-w-[1400px] px-6 py-24 md:py-32 lg:px-10">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label-caps text-[var(--color-muted)]">Aktuelle Angebote</p>
              <h2 className="mt-4 text-[length:var(--text-h2)] font-medium leading-[var(--text-h2--line-height)]">
                Aktuell verfügbar
              </h2>
            </div>
            <Link
              href="/unsere-angebote"
              className="text-sm font-medium text-[var(--color-accent)] underline underline-offset-4"
            >
              Alle Fahrzeuge ansehen
            </Link>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((v, i) => (
              <Reveal key={v.id} delay={(i % 3) * 80}>
                <VehicleCard vehicle={v} priority={i < 3} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      <FullBleedSection
        eyebrow="Standort"
        title="Besuchen Sie uns in Wiesbaden"
        subtitle={`${fullAddress()} · ${site.openingHours[0].days}: ${site.openingHours[0].hours}`}
        bgImage={LOCATION_IMG}
        primaryCta={{ label: "Kontakt & Anfahrt", href: "/kontakt" }}
        secondaryCta={{ label: "Route planen", href: mapsLink(), external: true }}
        align="left"
        anchor="bottom"
        minHeight="tall"
      />
    </>
  );
}
