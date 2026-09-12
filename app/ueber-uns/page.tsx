import type { Metadata } from "next";
import Image from "next/image";
import { FullBleedSection } from "@/components/sections/FullBleedSection";
import { Reveal } from "@/components/ui/Reveal";
import { fullAddress, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Über uns",
  description:
    "HF E-Autos in Wiesbaden – spezialisiert auf geprüfte Elektro- und Plug-in-Hybrid-Gebrauchtwagen. Inhabergeführt von Hamza Sarwari.",
  alternates: { canonical: "/ueber-uns" },
};

const ABOUT_IMG = "/images/ueber-uns-hero.png";
const STANDORT_IMG = "/images/standort-ueber-uns.png";

const PROCESS = [
  {
    step: "01",
    title: "Ankauf & Auswahl",
    text: "Wir kaufen gezielt gepflegte Elektro- und Plug-in-Hybrid-Fahrzeuge mit lückenloser Historie an.",
  },
  {
    step: "02",
    title: "Technische Prüfung",
    text: "Jedes Fahrzeug durchläuft eine Eingangsprüfung inklusive State-of-Health-Messung der Antriebsbatterie.",
  },
  {
    step: "03",
    title: "Aufbereitung",
    text: "Professionelle Innen- und Außenaufbereitung, Verschleißteile werden bei Bedarf ersetzt.",
  },
  {
    step: "04",
    title: "Übergabe",
    text: "Zulassung, Einweisung in die Ladefunktionen und – auf Wunsch – Lieferung bis vor die Haustür.",
  },
];

export default function AboutPage() {
  return (
    <>
      <FullBleedSection
        eyebrow="Über uns"
        title="Elektromobilität aus Überzeugung"
        subtitle={`${site.name} ist Ihr inhabergeführter Spezialist für gebrauchte Stromer in Wiesbaden.`}
        bgImage={ABOUT_IMG}
        align="left"
        anchor="bottom"
        minHeight="tall"
      />

      <section className="mx-auto max-w-[900px] px-6 py-20 md:py-28 lg:px-10">
        <Reveal>
          <p className="label-caps text-[var(--color-muted)]">Unsere Geschichte</p>
          <div className="mt-6 space-y-5 text-lg leading-relaxed">
            <p>
              HF E-Autos wurde von {site.owner} mit einem klaren Ziel gegründet:
              den Umstieg auf ein Elektroauto so einfach, transparent und
              vertrauenswürdig wie möglich zu machen. Statt eines breiten
              Gemischtwaren-Bestands konzentrieren wir uns ausschließlich auf
              batterieelektrische Fahrzeuge und Plug-in-Hybride.
            </p>
            <p>
              Wir kennen die Modelle, ihre Stärken und ihre typischen
              Schwachstellen. Diese Spezialisierung geben wir in der Beratung an
              Sie weiter – ehrlich, ohne Verkaufsdruck und mit dem Anspruch, dass
              Sie langfristig zufrieden fahren.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="border-t border-[var(--color-line)] bg-[var(--color-bg-alt)]">
        <div className="mx-auto max-w-[1400px] px-6 py-20 md:py-28 lg:px-10">
          <Reveal className="max-w-2xl">
            <h2 className="text-[length:var(--text-h2)] font-medium leading-[var(--text-h2--line-height)]">
              Warum elektrisch?
            </h2>
            <p className="mt-5 text-[var(--color-muted)]">
              Niedrigere Betriebskosten, kaum Verschleiß am Antrieb, leises
              Fahren und lokal emissionsfrei unterwegs. Ein gebrauchter Stromer
              verbindet die Vorteile der Elektromobilität mit einem deutlich
              geringeren Wertverlust als beim Neuwagen.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-20 md:py-28 lg:px-10">
        <Reveal>
          <p className="label-caps text-[var(--color-muted)]">So arbeiten wir</p>
          <h2 className="mt-4 text-[length:var(--text-h2)] font-medium leading-[var(--text-h2--line-height)]">
            Vom Ankauf bis zur Übergabe
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((item, i) => (
            <Reveal key={item.step} delay={(i % 4) * 80}>
              <p className="text-sm font-medium text-[var(--color-accent)]">
                {item.step}
              </p>
              <h3 className="mt-3 text-lg font-medium">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                {item.text}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--color-line)]">
        <div className="mx-auto max-w-[1400px] px-6 py-20 md:py-28 lg:px-10">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <Reveal className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[var(--color-bg-alt)] md:order-2">
              <Image
                src={STANDORT_IMG}
                alt="HF E-Autos Standort in Wiesbaden"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </Reveal>
            <Reveal className="md:order-1">
              <h2 className="text-[length:var(--text-h2)] font-medium leading-[var(--text-h2--line-height)]">
                Standort Wiesbaden
              </h2>
              <p className="mt-5 text-[var(--color-muted)]">
                Sie finden uns in {fullAddress()}. Eine Besichtigung und
                Probefahrt vereinbaren Sie am besten vorab telefonisch oder per
                E-Mail.
              </p>
            </Reveal>
          </div>
          <div className="mt-10">
            <Reveal delay={80}>
              <dl className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)] text-sm">
                {site.openingHours.map((oh) => (
                  <div key={oh.days} className="flex justify-between py-3">
                    <dt className="text-[var(--color-muted)]">{oh.days}</dt>
                    <dd className="font-medium">{oh.hours}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-sm">
                <a href={`tel:${site.phone.tel}`} className="underline underline-offset-4">
                  {site.phone.display}
                </a>
                <span className="mx-2 text-[var(--color-line)]">|</span>
                <a href={`mailto:${site.email}`} className="underline underline-offset-4">
                  {site.email}
                </a>
              </p>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
