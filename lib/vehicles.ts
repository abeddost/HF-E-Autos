import "server-only";
import { unstable_cache } from "next/cache";
import { FALLBACK_VEHICLES } from "@/data/vehicles";
import { getSnapshot } from "./store";
import type { Vehicle } from "./types";

export const VEHICLES_TAG = "vehicles";

export interface VehiclesResult {
  vehicles: Vehicle[];
  lastSync: string | null;
  source: "store" | "fallback";
}

async function loadVehicles(): Promise<VehiclesResult> {
  const snapshot = await getSnapshot();
  if (snapshot && snapshot.vehicles.length > 0) {
    return {
      vehicles: snapshot.vehicles,
      lastSync: snapshot.lastSync,
      source: "store",
    };
  }
  return { vehicles: FALLBACK_VEHICLES, lastSync: null, source: "fallback" };
}

/**
 * Cached read of the current inventory. Revalidated on a timer and
 * explicitly via revalidateTag(VEHICLES_TAG) after a successful sync.
 */
export const getVehicles = unstable_cache(loadVehicles, ["vehicles-snapshot"], {
  tags: [VEHICLES_TAG],
  revalidate: 900,
});

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const { vehicles } = await getVehicles();
  return vehicles.find((v) => v.slug === slug) ?? null;
}

export async function getFeaturedVehicles(count = 6): Promise<Vehicle[]> {
  const { vehicles } = await getVehicles();
  return [...vehicles]
    .sort((a, b) => {
      const byYear = (b.year ?? 0) - (a.year ?? 0);
      if (byYear !== 0) return byYear;
      return (b.price.raw || 0) - (a.price.raw || 0);
    })
    .slice(0, count);
}

export interface FilterFacets {
  makes: string[];
  fuels: string[];
  gearboxes: string[];
  bodyTypes: string[];
  priceMin: number;
  priceMax: number;
}

export function getFilterFacets(vehicles: Vehicle[]): FilterFacets {
  const makes = new Set<string>();
  const fuels = new Set<string>();
  const gearboxes = new Set<string>();
  const bodyTypes = new Set<string>();
  let priceMin = Number.POSITIVE_INFINITY;
  let priceMax = 0;

  for (const v of vehicles) {
    if (v.make) makes.add(v.make);
    if (v.fuel) fuels.add(v.fuel);
    if (v.gearbox) gearboxes.add(v.gearbox);
    if (v.bodyType) bodyTypes.add(v.bodyType);
    if (v.price.raw > 0) {
      priceMin = Math.min(priceMin, v.price.raw);
      priceMax = Math.max(priceMax, v.price.raw);
    }
  }

  return {
    makes: [...makes].sort((a, b) => a.localeCompare(b, "de")),
    fuels: [...fuels].sort((a, b) => a.localeCompare(b, "de")),
    gearboxes: [...gearboxes].sort((a, b) => a.localeCompare(b, "de")),
    bodyTypes: [...bodyTypes].sort((a, b) => a.localeCompare(b, "de")),
    priceMin: Number.isFinite(priceMin) ? priceMin : 0,
    priceMax,
  };
}
