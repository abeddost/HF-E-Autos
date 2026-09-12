import { site, whatsappLink } from "@/lib/site";
import type { Vehicle } from "@/lib/types";

interface StickySummaryProps {
  vehicle: Vehicle;
}

export function StickySummary({ vehicle }: StickySummaryProps) {
  const keySpecs = [
    vehicle.firstRegistration && {
      label: "Erstzulassung",
      value: vehicle.firstRegistration,
    },
    vehicle.mileage.raw > 0 && {
      label: "Kilometerstand",
      value: vehicle.mileage.formatted,
    },
    vehicle.power.kw > 0 && {
      label: "Leistung",
      value: `${vehicle.power.kw} kW (${vehicle.power.ps} PS)`,
    },
    vehicle.fuel && { label: "Kraftstoff", value: vehicle.fuel },
    vehicle.gearbox && { label: "Getriebe", value: vehicle.gearbox },
  ].filter(Boolean) as { label: string; value: string }[];

  const waText = `Hallo ${site.name}, ich interessiere mich für den ${vehicle.fullName} (${site.url}/unsere-angebote/${vehicle.slug}).`;

  return (
    <div className="lg:sticky lg:top-24">
      <p className="label-caps text-[var(--color-muted)]">{vehicle.condition}</p>
      <h1 className="mt-2 break-words text-2xl font-medium leading-tight md:text-3xl">
        {vehicle.fullName}
      </h1>
      {vehicle.modelDescription ? (
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {vehicle.modelDescription}
        </p>
      ) : null}

      <p className="mt-5 text-3xl font-medium">{vehicle.price.formatted}</p>
      <p className="mt-1 text-xs text-[var(--color-muted)]">
        inkl. 19 % MwSt., zzgl. Überführung
      </p>

      <dl className="mt-6 divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
        {keySpecs.map((spec) => (
          <div key={spec.label} className="flex items-center justify-between py-2.5 text-sm">
            <dt className="text-[var(--color-muted)]">{spec.label}</dt>
            <dd className="font-medium">{spec.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-col gap-3">
        <a
          href={`tel:${site.phone.tel}`}
          className="rounded-full bg-[var(--color-accent)] px-6 py-3.5 text-center text-sm font-medium uppercase tracking-[0.06em] text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          Anrufen · {site.phone.display}
        </a>
        <a
          href={whatsappLink(waText)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-[var(--color-fg)]/25 px-6 py-3.5 text-center text-sm font-medium uppercase tracking-[0.06em] transition-colors hover:bg-[var(--color-bg-alt)]"
        >
          WhatsApp-Anfrage
        </a>
        <a
          href="#kontakt"
          className="rounded-full border border-[var(--color-fg)]/25 px-6 py-3.5 text-center text-sm font-medium uppercase tracking-[0.06em] transition-colors hover:bg-[var(--color-bg-alt)]"
        >
          Anfrage per Formular
        </a>
      </div>

      {vehicle.mobileDeUrl ? (
        <a
          href={vehicle.mobileDeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-xs text-[var(--color-muted)] underline underline-offset-4 hover:text-[var(--color-fg)]"
        >
          Dieses Inserat auf mobile.de ansehen
        </a>
      ) : null}
    </div>
  );
}
