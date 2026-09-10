"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { cn } from "@/lib/cn";
import type { FilterFacets } from "@/lib/vehicles";
import type { Vehicle } from "@/lib/types";
import { VehicleCard } from "./VehicleCard";

interface InventoryViewProps {
  vehicles: Vehicle[];
  facets: FilterFacets;
}

const SORTS = [
  { value: "neu", label: "Neueste zuerst" },
  { value: "preis-auf", label: "Preis aufsteigend" },
  { value: "preis-ab", label: "Preis absteigend" },
  { value: "km-auf", label: "Kilometer aufsteigend" },
] as const;

const PRICE_STEPS = [10000, 15000, 20000, 25000, 30000, 40000, 60000];

export function InventoryView({ vehicles, facets }: InventoryViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const make = params.get("make") ?? "";
  const fuel = params.get("fuel") ?? "";
  const gearbox = params.get("gearbox") ?? "";
  const body = params.get("body") ?? "";
  const priceMax = Number(params.get("priceMax") ?? "") || 0;
  const sort = params.get("sort") ?? "neu";

  const activeCount = [make, fuel, gearbox, body, priceMax ? "p" : ""].filter(
    Boolean,
  ).length;

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const reset = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const filtered = useMemo(() => {
    let list = vehicles.filter((v) => {
      if (make && v.make !== make) return false;
      if (fuel && v.fuel !== fuel) return false;
      if (gearbox && v.gearbox !== gearbox) return false;
      if (body && v.bodyType !== body) return false;
      if (priceMax && v.price.raw > priceMax) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "preis-auf":
          return (a.price.raw || Infinity) - (b.price.raw || Infinity);
        case "preis-ab":
          return (b.price.raw || 0) - (a.price.raw || 0);
        case "km-auf":
          return (a.mileage.raw || Infinity) - (b.mileage.raw || Infinity);
        default:
          return (b.year ?? 0) - (a.year ?? 0) || (b.price.raw || 0) - (a.price.raw || 0);
      }
    });

    return list;
  }, [vehicles, make, fuel, gearbox, body, priceMax, sort]);

  const priceOptions = useMemo(() => {
    const cap = facets.priceMax || 60000;
    return PRICE_STEPS.filter((p) => p < cap);
  }, [facets.priceMax]);

  return (
    <>
      <div className="sticky top-16 z-30 border-y border-[var(--color-line)] bg-white/95 backdrop-blur">
        <div className="scrollbar-slim mx-auto flex max-w-[1400px] items-center gap-2 overflow-x-auto px-6 py-3 lg:px-10">
          <FilterSelect
            label="Marke"
            value={make}
            onChange={(v) => setParam("make", v)}
            options={facets.makes}
          />
          <FilterSelect
            label="Kraftstoff"
            value={fuel}
            onChange={(v) => setParam("fuel", v)}
            options={facets.fuels}
          />
          <FilterSelect
            label="Getriebe"
            value={gearbox}
            onChange={(v) => setParam("gearbox", v)}
            options={facets.gearboxes}
          />
          {facets.bodyTypes.length > 0 ? (
            <FilterSelect
              label="Karosserie"
              value={body}
              onChange={(v) => setParam("body", v)}
              options={facets.bodyTypes}
            />
          ) : null}
          <FilterSelect
            label="Preis bis"
            value={priceMax ? String(priceMax) : ""}
            onChange={(v) => setParam("priceMax", v)}
            options={priceOptions.map((p) => String(p))}
            format={(v) => `${Number(v).toLocaleString("de-DE")} €`}
          />

          <div className="ml-auto flex items-center gap-3 pl-3">
            {activeCount > 0 ? (
              <button
                type="button"
                onClick={reset}
                className="whitespace-nowrap text-sm text-[var(--color-muted)] underline underline-offset-4 hover:text-[var(--color-fg)]"
              >
                Zurücksetzen ({activeCount})
              </button>
            ) : null}
            <label className="flex items-center gap-2 whitespace-nowrap text-sm">
              <span className="text-[var(--color-muted)]">Sortierung</span>
              <select
                value={sort}
                onChange={(e) => setParam("sort", e.target.value === "neu" ? "" : e.target.value)}
                className="rounded-full border border-[var(--color-line)] bg-white px-3 py-1.5 text-sm"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10">
        <p className="mb-8 text-sm text-[var(--color-muted)]">
          {filtered.length}{" "}
          {filtered.length === 1 ? "Fahrzeug" : "Fahrzeuge"} verfügbar
        </p>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--color-line)] px-6 py-20 text-center">
            <p className="text-lg font-medium">Keine Fahrzeuge gefunden</p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Passen Sie die Filter an oder setzen Sie sie zurück.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 rounded-full border border-[var(--color-fg)]/25 px-5 py-2.5 text-sm font-medium"
            >
              Filter zurücksetzen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((v, i) => (
              <VehicleCard key={v.id} vehicle={v} priority={i < 3} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  format?: (value: string) => string;
}

function FilterSelect({ label, value, onChange, options, format }: FilterSelectProps) {
  return (
    <label
      className={cn(
        "relative flex shrink-0 items-center rounded-full border px-1 text-sm transition-colors",
        value
          ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5 text-[var(--color-accent)]"
          : "border-[var(--color-line)] bg-white",
      )}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none bg-transparent py-2 pl-3 pr-8 outline-none"
        aria-label={label}
      >
        <option value="">{label}: Alle</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {format ? format(opt) : opt}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 h-3 w-3"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden
      >
        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </label>
  );
}
