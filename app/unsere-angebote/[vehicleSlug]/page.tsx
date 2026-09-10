import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/contact/ContactForm";
import { Gallery } from "@/components/vehicles/Gallery";
import { StickySummary } from "@/components/vehicles/StickySummary";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";
import { getVehicleBySlug, getVehicles } from "@/lib/vehicles";

export const revalidate = 900;
export const dynamicParams = true;

export async function generateStaticParams() {
  const { vehicles } = await getVehicles();
  return vehicles.map((v) => ({ vehicleSlug: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ vehicleSlug: string }>;
}): Promise<Metadata> {
  const { vehicleSlug } = await params;
  const vehicle = await getVehicleBySlug(vehicleSlug);
  if (!vehicle) return { title: "Fahrzeug nicht gefunden" };

  const desc = `${vehicle.fullName} – ${vehicle.price.formatted}, ${[
    vehicle.firstRegistration,
    vehicle.mileage.formatted,
    vehicle.fuel,
    vehicle.gearbox,
  ]
    .filter(Boolean)
    .join(", ")}. Jetzt bei ${site.name} in ${site.address.city}.`;

  return {
    title: vehicle.fullName,
    description: desc,
    alternates: { canonical: `/unsere-angebote/${vehicle.slug}` },
    openGraph: {
      title: vehicle.fullName,
      description: desc,
      images: vehicle.images.main ? [{ url: vehicle.images.main }] : undefined,
      type: "website",
    },
  };
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ vehicleSlug: string }>;
}) {
  const { vehicleSlug } = await params;
  const vehicle = await getVehicleBySlug(vehicleSlug);
  if (!vehicle) notFound();

  const detailUrl = `${site.url}/unsere-angebote/${vehicle.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: vehicle.fullName,
    description: vehicle.description || vehicle.fullName,
    image: vehicle.images.gallery.slice(0, 6),
    brand: { "@type": "Brand", name: vehicle.make },
    model: vehicle.model,
    vehicleConfiguration: vehicle.modelDescription || undefined,
    mileageFromOdometer: vehicle.mileage.raw
      ? { "@type": "QuantitativeValue", value: vehicle.mileage.raw, unitCode: "KMT" }
      : undefined,
    vehicleTransmission: vehicle.gearbox || undefined,
    fuelType: vehicle.fuel || undefined,
    productionDate: vehicle.year ? String(vehicle.year) : undefined,
    vehicleIdentificationNumber: vehicle.vin || undefined,
    offers: vehicle.price.raw
      ? {
          "@type": "Offer",
          price: vehicle.price.raw,
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url: detailUrl,
          seller: { "@type": "AutoDealer", name: site.name },
        }
      : undefined,
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Start", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Fahrzeuge",
        item: `${site.url}/unsere-angebote`,
      },
      { "@type": "ListItem", position: 3, name: vehicle.fullName, item: detailUrl },
    ],
  };

  return (
    <article className="pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <div className="mx-auto max-w-[1400px] px-6 py-6 lg:px-10">
        <nav className="text-xs text-[var(--color-muted)]">
          <Link href="/unsere-angebote" className="hover:text-[var(--color-fg)]">
            ← Zurück zur Übersicht
          </Link>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <Gallery images={vehicle.images.gallery} alt={vehicle.fullName} />
          </div>
          <div className="lg:col-span-4">
            <StickySummary vehicle={vehicle} />
          </div>
        </div>
      </div>

      {/* Fahrzeugdaten */}
      <section className="border-t border-[var(--color-line)]">
        <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-24 lg:px-10">
          <Reveal>
            <h2 className="text-[length:var(--text-h2)] font-medium leading-[var(--text-h2--line-height)]">
              Fahrzeugdaten
            </h2>
          </Reveal>
          <dl className="mt-10 grid gap-x-12 gap-y-0 sm:grid-cols-2">
            {vehicle.specifications.map((spec) => (
              <div
                key={spec.label}
                className="flex items-center justify-between border-b border-[var(--color-line)] py-3.5 text-sm"
              >
                <dt className="text-[var(--color-muted)]">{spec.label}</dt>
                <dd className="text-right font-medium">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Ausstattung */}
      {vehicle.features.length > 0 ? (
        <section className="border-t border-[var(--color-line)] bg-[var(--color-bg-alt)]">
          <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-24 lg:px-10">
            <Reveal>
              <h2 className="text-[length:var(--text-h2)] font-medium leading-[var(--text-h2--line-height)]">
                Ausstattung
              </h2>
            </Reveal>
            <ul className="mt-10 grid gap-x-10 gap-y-2.5 text-sm sm:grid-cols-2 lg:grid-cols-3">
              {vehicle.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M4 10.5l3.5 3.5L16 6"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Beschreibung */}
      {vehicle.description ? (
        <section className="border-t border-[var(--color-line)]">
          <div className="mx-auto max-w-[900px] px-6 py-16 md:py-24 lg:px-10">
            <Reveal>
              <h2 className="text-[length:var(--text-h2)] font-medium leading-[var(--text-h2--line-height)]">
                Beschreibung
              </h2>
            </Reveal>
            <p className="mt-8 whitespace-pre-line leading-relaxed text-[var(--color-muted)]">
              {vehicle.description}
            </p>
          </div>
        </section>
      ) : null}

      {/* Kontakt */}
      <section id="kontakt" className="border-t border-[var(--color-line)] bg-[var(--color-bg-alt)]">
        <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-24 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-[length:var(--text-h2)] font-medium leading-[var(--text-h2--line-height)]">
                Interesse an diesem Fahrzeug?
              </h2>
              <p className="mt-4 text-[var(--color-muted)]">
                Schreiben Sie uns eine Nachricht – wir vereinbaren gern eine
                Probefahrt oder beantworten Ihre Fragen zu {vehicle.fullName}.
              </p>
              <div className="mt-8 space-y-1 text-sm">
                <p className="font-medium">{site.legalName}</p>
                <p className="text-[var(--color-muted)]">{site.address.street}</p>
                <p className="text-[var(--color-muted)]">
                  {site.address.zip} {site.address.city}
                </p>
                <p className="pt-2">
                  <a href={`tel:${site.phone.tel}`} className="underline underline-offset-4">
                    {site.phone.display}
                  </a>
                </p>
                <p>
                  <a href={`mailto:${site.email}`} className="underline underline-offset-4">
                    {site.email}
                  </a>
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-white p-6 md:p-8">
              <ContactForm vehicleName={vehicle.fullName} vehicleUrl={detailUrl} />
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
