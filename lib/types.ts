export interface VehiclePrice {
  /** Raw gross consumer price in EUR, e.g. 24990 */
  raw: number;
  /** Localised string, e.g. "24.990 €" */
  formatted: string;
}

export interface VehicleMileage {
  /** Raw km value, e.g. 45000 */
  raw: number;
  /** Localised string, e.g. "45.000 km" */
  formatted: string;
}

export interface VehiclePower {
  kw: number;
  ps: number;
}

export interface VehicleImages {
  main: string;
  gallery: string[];
}

export interface SpecEntry {
  label: string;
  value: string;
}

export interface SellerContact {
  name?: string;
  phone?: string;
  email?: string;
}

export interface Vehicle {
  /** mobile.de mobileAdId (string) */
  id: string;
  /** URL-friendly slug: make-model-id */
  slug: string;
  make: string;
  model: string;
  modelDescription: string;
  /** "VW ID.3 Pro Performance" */
  fullName: string;
  price: VehiclePrice;
  images: VehicleImages;
  mileage: VehicleMileage;
  /** "MM/YYYY" or "" when unknown */
  firstRegistration: string;
  /** Numeric year or null */
  year: number | null;
  /** German label, e.g. "Elektro" */
  fuel: string;
  /** German label, e.g. "Automatik" */
  gearbox: string;
  power: VehiclePower;
  vin?: string;
  /** German label, e.g. "Gebrauchtwagen" */
  condition: string;
  exteriorColor?: string;
  description: string;
  features: string[];
  specifications: SpecEntry[];
  sellerContact: SellerContact;
  /** Public mobile.de detail page */
  mobileDeUrl: string;
  /** German body-style label used by the mega-menu filters, e.g. "SUV" */
  bodyType?: string;
  /** Electric range in km (WLTP) when known */
  rangeKm?: number;
  /** Battery capacity in kWh when known */
  batteryKwh?: number;
  /** ISO timestamp of when this record was last mapped */
  updatedAt: string;
}

export interface InventorySnapshot {
  vehicles: Vehicle[];
  lastSync: string | null;
  /** content hash used to skip no-op writes */
  hash: string;
}

export interface SyncResult {
  changed: boolean;
  count: number;
  added: string[];
  removed: string[];
  updated: string[];
  lastSync: string;
  source: "mobile.de";
}
