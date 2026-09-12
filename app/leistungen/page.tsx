import type { Metadata } from "next";
import Image from "next/image";
import { FullBleedSection } from "@/components/sections/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Leistungen",
  description:
    "Finanzierung & Leasing, Inzahlungnahme, Garantie mit Batterie-Check sowie Wallbox-, Zulassungs- und Werkstattservice bei HF E-Autos in Wiesbaden.",
  alternates: { canonical: "/leistungen" },
};

const HERO_IMG = "/images/leistungen-hero.png";

export default function ServicesPage() {
  return (
    <>
      <FullBleedSection
        eyebrow="Leistungen"
        title="Alles für Ihren Umstieg auf elektrisch"
        subtitle="Von der Finanzierung bis zur Wallbox – wir begleiten Sie über den Fahrzeugkauf hinaus."
        bgImage={HERO_IMG}
        align="left"
        anchor="bottom"
        minHeight="tall"
      />

      {site.services.map((service, index) => (
        <section
          key={service.slug}
          id={service.slug}
          className={
            index % 2 === 1
              ? "border-t border-[var(--color-line)] bg-[var(--color-bg-alt)]"
              : "border-t border-[var(--color-line)]"
          }
        >
          <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-6 py-16 md:py-24 lg:grid-cols-2 lg:gap-16 lg:px-10">
            <Reveal className={index % 2 === 1 ? "lg:order-2" : ""}>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[var(--color-bg-alt)]">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={80} className={index % 2 === 1 ? "lg:order-1" : ""}>
              <p className="label-caps text-[var(--color-muted)]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-3 text-[length:var(--text-h2)] font-medium leading-[var(--text-h2--line-height)]">
                {service.title}
              </h2>
              <div className="mt-5 space-y-4 leading-relaxed text-[var(--color-muted)]">
                {service.body.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
              <div className="mt-8">
                <Button href="/kontakt" variant="secondary">
                  Beratung anfragen
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      ))}

      <FullBleedSection
        title="Noch Fragen zu unseren Leistungen?"
        subtitle="Rufen Sie uns an oder schreiben Sie uns – wir beraten Sie unverbindlich."
        bg="dark"
        theme="dark"
        minHeight="auto"
        primaryCta={{ label: "Kontakt aufnehmen", href: "/kontakt" }}
        secondaryCta={{
          label: `Anrufen · ${site.phone.display}`,
          href: `tel:${site.phone.tel}`,
        }}
      />
    </>
  );
}
