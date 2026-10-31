import { site } from "./site";
import type { Vehicle } from "./types";

/**
 * Google Merchant Center vehicle-ads feed (RSS 2.0 + g: namespace).
 * Spec: https://support.google.com/merchants/answer/11189169
 */

/** Google product taxonomy: Vehicles & Parts > Vehicles > Motor Vehicles > Cars, Trucks & Vans */
const GOOGLE_PRODUCT_CATEGORY = "916";

const MAX_TITLE = 150;
const MAX_DESCRIPTION = 5000;
const MAX_ADDITIONAL_IMAGES = 10;

const BODY_STYLES: Record<string, string> = {
  Cabrio: "convertible",
  Kombi: "wagon",
  Limousine: "sedan",
  SUV: "suv",
  Kleinwagen: "hatchback",
  "Sportwagen / Coupé": "coupe",
  Van: "van",
};

const ENGINES: Record<string, string> = {
  Elektro: "electric",
  Benzin: "gasoline",
  Diesel: "diesel",
  "Hybrid (Benzin/Elektro)": "hybrid",
  "Hybrid (Diesel/Elektro)": "hybrid",
  "Plug-in-Hybrid": "plug_in_hybrid",
  Wasserstoff: "hydrogen",
};

/** mobile.de sometimes returns the raw colour enum (e.g. "BLUE") */
const COLORS: Record<string, string> = {
  BLACK: "Schwarz",
  WHITE: "Weiß",
  GREY: "Grau",
  SILVER: "Silber",
  BLUE: "Blau",
  RED: "Rot",
  GREEN: "Grün",
  BROWN: "Braun",
  BEIGE: "Beige",
  YELLOW: "Gelb",
  ORANGE: "Orange",
  GOLD: "Gold",
  PURPLE: "Violett",
};

function escapeXml(value: string): string {
  return value
    // strip characters that are illegal in XML 1.0
    .replace(/[^\x09\x0A\x0D\x20-퟿-�]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}

function tag(name: string, value: string | number | null | undefined): string {
  if (value == null || value === "") return "";
  return `      <g:${name}>${escapeXml(String(value))}</g:${name}>\n`;
}

function buildDescription(v: Vehicle): string {
  if (v.description.trim()) return v.description.trim();

  const facts = [
    v.firstRegistration && `Erstzulassung ${v.firstRegistration}`,
    v.mileage.raw > 0 && v.mileage.formatted,
    v.power.kw > 0 && `${v.power.kw} kW (${v.power.ps} PS)`,
    v.fuel,
    v.gearbox,
    v.rangeKm && `Reichweite ${v.rangeKm} km (WLTP)`,
    v.batteryKwh && `Batterie ${v.batteryKwh} kWh`,
  ].filter(Boolean);

  const parts = [`${v.fullName}. ${facts.join(" · ")}.`];
  if (v.features.length > 0) parts.push(`Ausstattung: ${v.features.join(", ")}.`);
  parts.push(`Jetzt bei ${site.name} in ${site.address.city} – Probefahrt vereinbaren.`);
  return parts.join(" ");
}

function isListable(v: Vehicle): boolean {
  return v.price.raw > 0 && Boolean(v.images.main);
}

function itemXml(v: Vehicle, base: string, storeCode: string | undefined): string {
  const additionalImages = [...new Set(v.images.gallery)]
    .filter((src) => src !== v.images.main)
    .slice(0, MAX_ADDITIONAL_IMAGES);

  return [
    "    <item>\n",
    tag("id", v.id),
    tag("title", truncate(v.fullName, MAX_TITLE)),
    tag("description", truncate(buildDescription(v), MAX_DESCRIPTION)),
    tag("link", `${base}/unsere-angebote/${v.slug}`),
    tag("image_link", v.images.main),
    ...additionalImages.map((src) => tag("additional_image_link", src)),
    tag("price", `${v.price.raw.toFixed(2)} EUR`),
    tag("availability", "in_stock"),
    tag("condition", v.condition === "Neuwagen" ? "new" : "used"),
    tag("google_product_category", GOOGLE_PRODUCT_CATEGORY),
    tag("brand", v.make),
    tag("model", v.model),
    tag("year", v.year),
    tag("mileage", v.mileage.raw > 0 ? `${v.mileage.raw} km` : undefined),
    tag("vin", v.vin),
    tag("color", v.exteriorColor && (COLORS[v.exteriorColor.toUpperCase()] ?? v.exteriorColor)),
    tag("body_style", v.bodyType && BODY_STYLES[v.bodyType]),
    tag("engine", ENGINES[v.fuel]),
    tag("store_code", storeCode),
    tag("vehicle_fulfillment", storeCode && `in_store:${storeCode}`),
    "    </item>\n",
  ].join("");
}

export function buildGoogleVehiclesFeed(vehicles: Vehicle[]): string {
  const base = site.url.replace(/\/$/, "");
  // Must match the store code in the linked Google Business Profile
  const storeCode = process.env.GOOGLE_MERCHANT_STORE_CODE?.trim() || undefined;
  const items = vehicles.filter(isListable).map((v) => itemXml(v, base, storeCode));

  return [
    '<?xml version="1.0" encoding="UTF-8"?>\n',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n',
    "  <channel>\n",
    `    <title>${escapeXml(`${site.name} – Fahrzeugbestand`)}</title>\n`,
    `    <link>${escapeXml(`${base}/unsere-angebote`)}</link>\n`,
    `    <description>${escapeXml(site.description)}</description>\n`,
    ...items,
    "  </channel>\n",
    "</rss>\n",
  ].join("");
}
