import type { Metadata } from "next";
import { Suspense } from "react";
import { InventoryView } from "@/components/vehicles/InventoryView";
import { getFilterFacets, getVehicles } from "@/lib/vehicles";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Fahrzeuge",
  description:
    "Alle verfügbaren Elektro- und Plug-in-Hybrid-Gebrauchtwagen von HF E-Autos in Wiesbaden. Täglich aktualisiert.",
  alternates: { canonical: "/unsere-angebote" },
};

export default async function InventoryPage() {
  const { vehicles, source, lastSync } = await getVehicles();
  const facets = getFilterFacets(vehicles);

  return (
    <div className="pb-8 pt-24">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <p className="label-caps text-[var(--color-muted)]">Bestand</p>
        <h1 className="mt-3 text-[length:var(--text-h2)] font-medium leading-[var(--text-h2--line-height)]">
          Unsere Fahrzeuge
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
          Geprüfte Elektro- und Plug-in-Hybrid-Gebrauchtwagen. Der Bestand wird
          einmal täglich automatisch mit mobile.de abgeglichen
          {source === "fallback"
            ? " – aktuell sehen Sie eine Vorschau."
            : lastSync
              ? `. Zuletzt aktualisiert am ${new Date(lastSync).toLocaleDateString("de-DE")}.`
              : "."}
        </p>
      </div>

      <div className="mt-8">
        <Suspense fallback={null}>
          <InventoryView vehicles={vehicles} facets={facets} />
        </Suspense>
      </div>
    </div>
  );
}
