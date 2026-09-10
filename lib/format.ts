const EUR = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const NUM = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

export function formatPrice(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value) || value <= 0) return "Preis auf Anfrage";
  return EUR.format(value);
}

export function formatMileage(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "–";
  return `${NUM.format(value)} km`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "–";
  return NUM.format(value);
}

/** "202403" | "2024-03" | 202403 -> "03/2024" */
export function formatFirstRegistration(input: string | number | null | undefined): string {
  if (input == null) return "";
  const digits = String(input).replace(/\D/g, "");
  if (digits.length === 6) {
    const year = digits.slice(0, 4);
    const month = digits.slice(4, 6);
    return `${month}/${year}`;
  }
  if (digits.length === 4) return digits;
  return "";
}

export function registrationYear(input: string | number | null | undefined): number | null {
  if (input == null) return null;
  const digits = String(input).replace(/\D/g, "");
  if (digits.length >= 4) {
    const year = Number(digits.slice(0, 4));
    return Number.isFinite(year) ? year : null;
  }
  return null;
}

export function kwToPs(kw: number | null | undefined): number {
  if (!kw || Number.isNaN(kw)) return 0;
  return Math.round(kw * 1.35962);
}

const UMLAUTS: Record<string, string> = {
  ä: "ae",
  ö: "oe",
  ü: "ue",
  ß: "ss",
  Ä: "ae",
  Ö: "oe",
  Ü: "ue",
};

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[äöüßÄÖÜ]/g, (m) => UMLAUTS[m] ?? m)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function vehicleSlug(make: string, model: string, id: string): string {
  const base = slugify([make, model].filter(Boolean).join("-"));
  return base ? `${base}-${id}` : `fahrzeug-${id}`;
}
