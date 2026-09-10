import Image from "next/image";
import Link from "next/link";
import type { Vehicle } from "@/lib/types";

interface VehicleCardProps {
  vehicle: Vehicle;
  priority?: boolean;
}

export function VehicleCard({ vehicle, priority = false }: VehicleCardProps) {
  const specs = [
    vehicle.price.formatted,
    vehicle.mileage.raw > 0 ? vehicle.mileage.formatted : null,
    vehicle.firstRegistration || (vehicle.year ? String(vehicle.year) : null),
    [vehicle.fuel, vehicle.gearbox].filter(Boolean).join(" · "),
  ].filter(Boolean) as string[];

  return (
    <Link
      href={`/unsere-angebote/${vehicle.slug}`}
      className="group flex flex-col outline-none"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-[var(--color-bg-alt)]">
        {vehicle.images.main ? (
          <Image
            src={vehicle.images.main}
            alt={vehicle.fullName}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--color-muted)]">
            Kein Bild
          </div>
        )}
        {vehicle.bodyType ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.08em] text-[var(--color-fg)] backdrop-blur">
            {vehicle.bodyType}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <h3 className="text-lg font-medium leading-snug transition-colors group-hover:text-[var(--color-accent)]">
          {vehicle.fullName}
        </h3>
        {vehicle.modelDescription ? (
          <p className="mt-1 line-clamp-1 text-sm text-[var(--color-muted)]">
            {vehicle.modelDescription}
          </p>
        ) : null}

        <dl className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-muted)]">
          {specs.map((spec, i) => (
            <span key={spec} className="flex items-center gap-3">
              {i > 0 ? (
                <span aria-hidden className="text-[var(--color-line)]">
                  |
                </span>
              ) : null}
              <span className={i === 0 ? "font-medium text-[var(--color-fg)]" : ""}>
                {spec}
              </span>
            </span>
          ))}
        </dl>
      </div>
    </Link>
  );
}
