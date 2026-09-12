import "server-only";
import {
  formatFirstRegistration,
  formatMileage,
  formatPrice,
  kwToPs,
  registrationYear,
  vehicleSlug,
} from "./format";
import { getSnapshot, setSnapshot } from "./store";
import type {
  InventorySnapshot,
  SpecEntry,
  SyncResult,
  Vehicle,
} from "./types";

const BASE_URL = "https://services.mobile.de";
const ACCEPT = "application/vnd.de.mobile.api+json";
const IMAGE_CONCURRENCY = 4;
const PAGE_SIZE = 100;

export class MobileDeConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MobileDeConfigError";
  }
}

export class MobileDeApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "MobileDeApiError";
    this.status = status;
  }
}

interface MobileDeCreds {
  username: string;
  password: string;
  sellerId: string;
}

function readCreds(): MobileDeCreds {
  const username = process.env.MOBILE_DE_USERNAME?.trim();
  const password = process.env.MOBILE_DE_PASSWORD?.trim();
  const sellerId = process.env.MOBILE_DE_SELLER_ID?.trim();
  if (!username || !password || !sellerId) {
    throw new MobileDeConfigError(
      "mobile.de sync is not configured. Set MOBILE_DE_USERNAME, MOBILE_DE_PASSWORD and MOBILE_DE_SELLER_ID.",
    );
  }
  return { username, password, sellerId };
}

export function isMobileDeConfigured(): boolean {
  return Boolean(
    process.env.MOBILE_DE_USERNAME &&
      process.env.MOBILE_DE_PASSWORD &&
      process.env.MOBILE_DE_SELLER_ID,
  );
}

async function apiGet<T = unknown>(path: string, creds: MobileDeCreds): Promise<T> {
  const auth = Buffer.from(`${creds.username}:${creds.password}`).toString("base64");
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Basic ${auth}`, Accept: ACCEPT },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new MobileDeApiError(
      `mobile.de ${res.status} ${res.statusText} on ${path}${body ? ` – ${body.slice(0, 300)}` : ""}`,
      res.status,
    );
  }
  return (await res.json()) as T;
}

// ── generic shape helpers (tolerate flat JSON *and* XML-derived JSON) ──
type Raw = Record<string, unknown>;

function isObj(v: unknown): v is Raw {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function asArray<T>(v: unknown): T[] {
  if (v == null) return [];
  return (Array.isArray(v) ? v : [v]) as T[];
}

/** Pull the first defined value at any of the given dot-paths. */
function pick(obj: unknown, paths: string[]): unknown {
  for (const path of paths) {
    let cur: unknown = obj;
    for (const seg of path.split(".")) {
      if (!isObj(cur)) {
        cur = undefined;
        break;
      }
      cur = cur[seg];
    }
    if (cur !== undefined && cur !== null && cur !== "") return cur;
  }
  return undefined;
}

/** Human-readable label from a string or a { key/localized } enum object. */
function localize(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (isObj(v)) {
    const label =
      v.localized ?? v.local ?? v.description ?? v.value ?? v["#text"] ?? v.name;
    if (label != null) return String(label);
    if (v["@key"] != null) return prettifyEnum(String(v["@key"]));
    if (v.key != null) return prettifyEnum(String(v.key));
  }
  return "";
}

/** Raw enum key from a string or a { key } enum object. */
function enumKey(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (isObj(v)) return String(v["@key"] ?? v.key ?? v.name ?? v.value ?? "");
  return String(v);
}

function prettifyEnum(key: string): string {
  return key
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function toNumber(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  let s = String(v).trim().replace(/[^\d.,-]/g, "");
  if (s.includes(".") && s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", "."); // 1.234,56 -> 1234.56
  } else if (s.includes(",")) {
    s = s.replace(",", ".");
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

// ── enum → German label maps ─────────────────────────────────
const FUEL_LABELS: Record<string, string> = {
  ELECTRICITY: "Elektro",
  PETROL: "Benzin",
  DIESEL: "Diesel",
  LPG: "Autogas (LPG)",
  CNG: "Erdgas (CNG)",
  HYBRID: "Hybrid (Benzin/Elektro)",
  HYBRID_DIESEL: "Hybrid (Diesel/Elektro)",
  PLUGIN_HYBRID_PETROL: "Plug-in-Hybrid",
  PLUGIN_HYBRID_DIESEL: "Plug-in-Hybrid",
  PLUGIN_HYBRID: "Plug-in-Hybrid",
  HYDROGENIUM: "Wasserstoff",
  ETHANOL: "Ethanol (FFV, E85 etc.)",
  OTHER: "Andere",
};

const GEARBOX_LABELS: Record<string, string> = {
  MANUAL_GEAR: "Schaltgetriebe",
  AUTOMATIC_GEAR: "Automatik",
  SEMIAUTOMATIC_GEAR: "Halbautomatik",
};

const CATEGORY_LABELS: Record<string, string> = {
  Cabrio: "Cabrio",
  EstateCar: "Kombi",
  Limousine: "Limousine",
  OffRoad: "SUV",
  SmallCar: "Kleinwagen",
  SportsCar: "Sportwagen / Coupé",
  Van: "Van",
  OtherCar: "Sonstige",
};

const CONDITION_LABELS: Record<string, string> = {
  NEW: "Neuwagen",
  USED: "Gebrauchtwagen",
  DEMONSTRATION: "Vorführfahrzeug",
  EMPLOYEES_CAR: "Jahreswagen",
  PRE_REGISTRATION: "Tageszulassung",
  ANTIQUE: "Oldtimer",
};

const DOOR_LABELS: Record<string, string> = {
  TWO_OR_THREE: "2/3",
  FOUR_OR_FIVE: "4/5",
};

const FEATURE_LABELS: Record<string, string> = {
  ABS: "ABS",
  ADAPTIVE_CORNERING_LIGHTS: "Kurvenlicht",
  ADAPTIVE_CRUISE_CONTROL: "Abstandstempomat (ACC)",
  AIR_SUSPENSION: "Luftfederung",
  ALARM_SYSTEM: "Alarmanlage",
  ALLOY_WHEELS: "Leichtmetallfelgen",
  ALL_SEASON_TIRES: "Allwetterreifen",
  ALL_WHEEL_DRIVE: "Allradantrieb",
  AMBIENT_LIGHTING: "Ambientebeleuchtung",
  ANDROID_AUTO: "Android Auto",
  APPLE_CARPLAY: "Apple CarPlay",
  ARMREST: "Armlehne",
  AUTOMATIC_CLIMATISATION: "Klimaautomatik",
  AUXILIARY_HEATING: "Standheizung",
  BENDING_LIGHTS: "Abbiegelicht",
  BI_XENON_HEADLIGHTS: "Bi-Xenon-Scheinwerfer",
  BLUETOOTH: "Bluetooth",
  BOARD_COMPUTER: "Bordcomputer",
  CD_MULTICHANGER: "CD-Wechsler",
  CD_PLAYER: "CD-Player",
  CENTRAL_LOCKING: "Zentralverriegelung",
  COLLISION_AVOIDANCE: "Notbremsassistent",
  CRUISE_CONTROL: "Tempomat",
  DAYTIME_RUNNING_LAMPS: "Tagfahrlicht",
  DISTANCE_WARNING_SYSTEM: "Abstandswarner",
  ELECTRICAL_SIDE_MIRRORS: "Elektr. Seitenspiegel",
  ELECTRIC_ADJUSTABLE_SEATS: "Elektr. Sitzeinstellung",
  ELECTRIC_HEATED_SEATS: "Sitzheizung",
  ELECTRIC_TAILGATE: "Elektr. Heckklappe",
  ELECTRIC_WINDOWS: "Elektr. Fensterheber",
  EMERGENCY_CALL_SYSTEM: "Notrufsystem",
  ESP: "ESP",
  FOG_LIGHTS: "Nebelscheinwerfer",
  FRONT_FOG_LIGHTS: "Nebelscheinwerfer vorn",
  FULL_LED_HEADLIGHTS: "LED-Scheinwerfer",
  HANDS_FREE_KIT: "Freisprecheinrichtung",
  HEADLIGHT_WASHER_SYSTEM: "Scheinwerferreinigung",
  HEAD_UP_DISPLAY: "Head-up-Display",
  HEATED_STEERING_WHEEL: "Lenkradheizung",
  HeatPump: "Wärmepumpe",
  HEAT_PUMP: "Wärmepumpe",
  HIGH_BEAM_ASSIST: "Fernlichtassistent",
  IMMOBILIZER: "Wegfahrsperre",
  ISOFIX: "Isofix",
  KEYLESS_ENTRY: "Keyless Entry",
  LANE_DEPARTURE_WARNING: "Spurhalteassistent",
  LEATHER_SEATS: "Lederausstattung",
  LEATHER_STEERING_WHEEL: "Lederlenkrad",
  LIGHT_SENSOR: "Lichtsensor",
  LUMBAR_SUPPORT: "Lordosenstütze",
  MP3: "MP3",
  MULTIFUNCTIONAL_WHEEL: "Multifunktionslenkrad",
  NAVIGATION_SYSTEM: "Navigationssystem",
  NIGHT_VISION_ASSIST: "Nachtsichtassistent",
  PANORAMIC_ROOF: "Panoramadach",
  PARKING_ASSISTANTS: "Einparkhilfe",
  PADDLE_SHIFTERS: "Schaltwippen",
  POWER_ASSISTED_STEERING: "Servolenkung",
  RADIO_DAB: "DAB-Radio",
  RAIN_SENSOR: "Regensensor",
  REVERSING_CAMERA: "Rückfahrkamera",
  ROOF_RACK: "Dachreling",
  SLIDING_DOOR: "Schiebetür",
  SOUND_SYSTEM: "Soundsystem",
  SPEED_LIMIT_CONTROL_SYSTEM: "Verkehrszeichenerkennung",
  SPORT_PACKAGE: "Sportpaket",
  SPORT_SEATS: "Sportsitze",
  START_STOP_SYSTEM: "Start-Stopp-Automatik",
  SUNROOF: "Schiebedach",
  TInted_WINDOWS: "Getönte Scheiben",
  TINTED_WINDOWS: "Getönte Scheiben",
  TRACTION_CONTROL_SYSTEM: "Antriebsschlupfregelung",
  TRAILER_COUPLING: "Anhängerkupplung",
  TRAILER_COUPLING_FIXED: "Anhängerkupplung fest",
  TRAILER_COUPLING_SWIVELLING: "Anhängerkupplung schwenkbar",
  TRAILER_COUPLING_DETACHABLE: "Anhängerkupplung abnehmbar",
  TÜV_AU_NEW: "TÜV/AU neu",
  TUV_AU_NEW: "TÜV/AU neu",
  USB: "USB",
  VOICE_CONTROL: "Sprachsteuerung",
  WIRELESS_CHARGING: "Induktionsladen Smartphone",
  XENON_HEADLIGHTS: "Xenon-Scheinwerfer",
};

function featureLabel(raw: unknown): string {
  const localized = localize(raw);
  const key = enumKey(raw);
  if (key && FEATURE_LABELS[key]) return FEATURE_LABELS[key];
  if (localized && localized !== prettifyEnum(key)) return localized;
  return key ? prettifyEnum(key) : localized;
}

// ── image URL handling ───────────────────────────────────────
function upgradeImageUrl(url: string): string {
  if (!url) return url;
  let out = url;
  // classistatic "rule=mo-590.jpg" → request the large rendition
  out = out.replace(/rule=mo-\d+(\.[a-z]+)?/i, "rule=mo-1600.jpg");
  // legacy "$_12.JPG" / "$_57.JPG" size tokens → big
  out = out.replace(/\$_\d+\.(jpe?g)/i, "$_27.$1");
  return out;
}

function extractImages(source: unknown): { main: string; gallery: string[] } {
  // Accepts: [{ref}], {images:[...]}, {image:[{representation:[{@url,@size}]}]}
  let list: unknown[] = [];
  if (Array.isArray(source)) list = source;
  else if (isObj(source)) {
    list =
      asArray(source.images).length > 0
        ? asArray(source.images)
        : asArray((source.images as Raw | undefined)?.image ?? source.image);
  }

  const urls: string[] = [];
  for (const item of list) {
    if (typeof item === "string") {
      urls.push(item);
      continue;
    }
    if (!isObj(item)) continue;
    const direct =
      (item.ref as string) ??
      (item.uri as string) ??
      (item.url as string) ??
      (item["@url"] as string) ??
      // Search API images expose their renditions directly as string fields.
      (typeof item.xxxl === "string" ? item.xxxl : undefined) ??
      (typeof item.xxl === "string" ? item.xxl : undefined) ??
      (typeof item.xl === "string" ? item.xl : undefined) ??
      (typeof item.l === "string" ? item.l : undefined) ??
      (typeof item.m === "string" ? item.m : undefined) ??
      (typeof item.s === "string" ? item.s : undefined) ??
      (isObj(item.xxxl) ? (item.xxxl["@url"] as string) : undefined) ??
      (isObj(item.xxl) ? (item.xxl["@url"] as string) : undefined);
    if (direct) {
      urls.push(direct);
      continue;
    }
    const reps = asArray<Raw>(item.representation ?? item.representations);
    if (reps.length) {
      const priority = ["XXL", "XL", "L", "M", "S", "ICON"];
      reps.sort(
        (a, b) =>
          priority.indexOf(String(a["@size"] ?? a.size ?? "")) -
          priority.indexOf(String(b["@size"] ?? b.size ?? "")),
      );
      const best = reps.find((r) => r["@url"] ?? r.url ?? r.uri);
      const u = (best?.["@url"] ?? best?.url ?? best?.uri) as string | undefined;
      if (u) urls.push(u);
    }
  }

  const clean = urls
    .filter(Boolean)
    .map((u) => upgradeImageUrl(u.startsWith("//") ? `https:${u}` : u));
  const deduped = [...new Set(clean)];
  return { main: deduped[0] ?? "", gallery: deduped };
}

// ── concurrency-limited map ──────────────────────────────────
async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
  return results;
}

// ── ad → Vehicle mapping ─────────────────────────────────────
function mapAdToVehicle(ad: Raw, imagesResponse: unknown): Vehicle {
  const vehicle = (isObj(ad.vehicle) ? ad.vehicle : ad) as Raw;

  const id = String(
    pick(ad, ["mobileAdId", "@key", "key", "adId"]) ?? "",
  );

  const make =
    localize(pick(vehicle, ["make"])) ||
    prettifyEnum(enumKey(pick(vehicle, ["make"])));
  const model = localize(pick(vehicle, ["model", "modelName"]));
  const modelDescription = String(
    pick(vehicle, ["modelDescription", "model-description"]) ?? "",
  ).trim();

  // Dealers often type the model name directly into modelDescription
  // (sometimes twice), so appending `model` unconditionally produces
  // titles like "GLE 350 GLE 350 GLE 350 de …". Strip any leading
  // repeats of `model` from modelDescription before joining.
  let descriptionTail = modelDescription;
  if (model) {
    const modelLower = model.toLowerCase();
    while (descriptionTail.toLowerCase().startsWith(`${modelLower} `)) {
      descriptionTail = descriptionTail.slice(model.length + 1).trim();
    }
  }
  const nameParts =
    model && descriptionTail.toLowerCase().startsWith(model.toLowerCase())
      ? [make, descriptionTail]
      : [make, model, descriptionTail];

  const fullName = nameParts
    .map((s) => (s ?? "").trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ");

  const priceRaw = toNumber(
    pick(ad, [
      "price.consumerPriceGross",
      "price.gross",
      "price.amount",
      "price.consumerPriceGross.@value",
      "price.value",
    ]),
  );

  const mileageRaw = toNumber(
    pick(vehicle, ["mileage", "mileageInKm", "mileage.@value"]),
  );

  const firstRegRaw = pick(vehicle, [
    "firstRegistration",
    "firstRegistrationDate",
    "first-registration",
  ]);
  const firstRegistration = formatFirstRegistration(
    typeof firstRegRaw === "string" || typeof firstRegRaw === "number"
      ? firstRegRaw
      : localize(firstRegRaw),
  );
  const year = registrationYear(
    typeof firstRegRaw === "string" || typeof firstRegRaw === "number"
      ? firstRegRaw
      : localize(firstRegRaw),
  );

  const fuelKey = enumKey(pick(vehicle, ["fuel", "fuelType"]));
  const fuel =
    FUEL_LABELS[fuelKey] ||
    localize(pick(vehicle, ["fuel", "fuelType"])) ||
    prettifyEnum(fuelKey);

  const gearboxKey = enumKey(pick(vehicle, ["gearbox", "transmission"]));
  const gearbox =
    GEARBOX_LABELS[gearboxKey] ||
    localize(pick(vehicle, ["gearbox", "transmission"])) ||
    prettifyEnum(gearboxKey);

  const kw = toNumber(pick(vehicle, ["power", "powerInKw", "kw"]));
  const ps = kwToPs(kw);

  const conditionKey = enumKey(
    pick(vehicle, ["usageType", "condition", "usage-type"]),
  );
  const condition =
    CONDITION_LABELS[conditionKey] ||
    localize(pick(vehicle, ["usageType", "condition"])) ||
    "Gebrauchtwagen";

  const categoryKey = enumKey(pick(vehicle, ["category", "categories"]));
  const bodyType =
    CATEGORY_LABELS[categoryKey] ||
    localize(pick(vehicle, ["category"])) ||
    (categoryKey ? prettifyEnum(categoryKey) : undefined);

  const exteriorColor =
    localize(pick(vehicle, ["exteriorColor"])) ||
    String(pick(vehicle, ["manufacturerColorName"]) ?? "") ||
    undefined;

  const vin = String(pick(vehicle, ["vin"]) ?? "") || undefined;

  const description = String(
    pick(ad, ["plainTextDescription", "description", "htmlDescription"]) ?? "",
  )
    .replace(/<br\s*\/?>(?=)/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();

  const featureSource =
    pick(vehicle, ["features", "features.feature"]) ?? [];
  const features = asArray(featureSource)
    .map((f) => featureLabel(f))
    .filter(Boolean);

  const batteryKwh =
    toNumber(pick(vehicle, ["batteryCapacity", "battery.capacity"])) || undefined;
  const rangeKm =
    toNumber(
      pick(vehicle, [
        "electricRange",
        "wltpElectricRange",
        "range",
        "electricRangeInKm",
      ]),
    ) || undefined;

  const numSeats = toNumber(pick(vehicle, ["numSeats", "seatCount", "seats"]));
  const doorKey = enumKey(pick(vehicle, ["doorCount", "numberOfDoors", "doors"]));
  const emissionClass = localize(pick(vehicle, ["emissionClass"]));
  const envKey = localize(pick(vehicle, ["climatisation"]));

  const specifications: SpecEntry[] = [
    firstRegistration && { label: "Erstzulassung", value: firstRegistration },
    mileageRaw > 0 && { label: "Kilometerstand", value: formatMileage(mileageRaw) },
    kw > 0 && { label: "Leistung", value: `${kw} kW (${ps} PS)` },
    fuel && { label: "Kraftstoff", value: fuel },
    gearbox && { label: "Getriebe", value: gearbox },
    bodyType && { label: "Fahrzeugtyp", value: bodyType },
    condition && { label: "Fahrzeugzustand", value: condition },
    exteriorColor && { label: "Außenfarbe", value: exteriorColor },
    doorKey && { label: "Türen", value: DOOR_LABELS[doorKey] ?? prettifyEnum(doorKey) },
    numSeats > 0 && { label: "Sitzplätze", value: String(numSeats) },
    emissionClass && { label: "Schadstoffklasse", value: emissionClass },
    envKey && { label: "Klimatisierung", value: envKey },
    batteryKwh && { label: "Batteriekapazität", value: `${batteryKwh} kWh` },
    rangeKm && { label: "Reichweite (WLTP)", value: `${rangeKm} km` },
    vin && { label: "FIN", value: vin },
  ].filter(Boolean) as SpecEntry[];

  const contact = (isObj(ad.contact) ? ad.contact : {}) as Raw;

  const detailUrl =
    String(pick(ad, ["detailPageUrl", "url", "@url"]) ?? "") ||
    (id ? `https://suchen.mobile.de/fahrzeuge/details.html?id=${id}` : "");

  const images = extractImages(
    imagesResponse ?? ad.images ?? (isObj(ad.images) ? ad.images : undefined),
  );

  return {
    id,
    slug: vehicleSlug(make || "fahrzeug", model || "", id),
    make: make || "—",
    model,
    modelDescription,
    fullName: fullName || make || "Fahrzeug",
    price: { raw: priceRaw, formatted: formatPrice(priceRaw) },
    images,
    mileage: { raw: mileageRaw, formatted: formatMileage(mileageRaw) },
    firstRegistration,
    year,
    fuel,
    gearbox,
    power: { kw, ps },
    vin,
    condition,
    exteriorColor,
    description,
    features,
    specifications,
    sellerContact: {
      name: String(pick(contact, ["contactName", "name"]) ?? "") || undefined,
      phone: String(pick(contact, ["phone", "phoneNumber"]) ?? "") || undefined,
      email: String(pick(contact, ["email"]) ?? "") || undefined,
    },
    mobileDeUrl: detailUrl,
    bodyType,
    rangeKm,
    batteryKwh,
    updatedAt: new Date().toISOString(),
  };
}

// ── list + paging ────────────────────────────────────────────
function extractAdArray(payload: unknown): Raw[] {
  if (Array.isArray(payload)) return payload as Raw[];
  if (!isObj(payload)) return [];
  const candidates = [
    payload.ads,
    isObj(payload.ads) ? (payload.ads as Raw).ad : undefined,
    isObj(payload["search-result"])
      ? ((payload["search-result"] as Raw).ads as Raw | undefined)?.ad
      : undefined,
    payload.items,
    payload.content,
  ];
  for (const c of candidates) {
    const arr = asArray<Raw>(c);
    if (arr.length) return arr;
  }
  return [];
}

function extractPaging(payload: unknown): { current: number; max: number } {
  const p = isObj(payload) ? payload : {};
  const page = isObj(p.page) ? p.page : p;
  const current = toNumber(
    pick(page, ["number", "current-page", "currentPage", "@number"]) ?? 1,
  );
  const max = toNumber(
    pick(page, [
      "totalPages",
      "max-pages",
      "maxPages",
      "@max-pages",
      "total-pages",
    ]) ?? 1,
  );
  return { current: current || 1, max: max || 1 };
}

async function fetchAllAds(creds: MobileDeCreds): Promise<Raw[]> {
  const all: Raw[] = [];
  let page = 1;
  let maxPages = 1;
  do {
    const payload = await apiGet<unknown>(
      // This dealer has Search API (Ad-Integration) access, not Seller API
      // access. Search API is the read-only API intended for displaying a
      // dealer's inventory and includes the public, active ads.
      `/search-api/search?customerId=${encodeURIComponent(creds.sellerId)}&page.number=${page}&page.size=${PAGE_SIZE}`,
      creds,
    );
    all.push(...extractAdArray(payload));
    const paging = extractPaging(payload);
    maxPages = paging.max;
    page += 1;
  } while (page <= maxPages && page <= 50);
  return all;
}

async function fetchAdDetails(
  creds: MobileDeCreds,
  adId: string,
): Promise<unknown> {
  try {
    return await apiGet<unknown>(
      `/search-api/ad/${encodeURIComponent(adId)}`,
      creds,
    );
  } catch {
    return null;
  }
}

const ACTIVE_STATUSES = new Set(["ACTIVE", "ONLINE", "PUBLISHED"]);

function isActive(ad: Raw): boolean {
  const status = enumKey(pick(ad, ["adStatus", "status", "ad-status"])).toUpperCase();
  if (!status) return true; // seller-api sometimes omits status on already-filtered lists
  return ACTIVE_STATUSES.has(status);
}

// ── change detection ─────────────────────────────────────────
function contentHash(vehicles: Vehicle[]): string {
  const material = vehicles
    .map((v) =>
      [
        v.id,
        v.price.raw,
        v.mileage.raw,
        v.images.gallery.length,
        v.images.main,
        v.fullName,
      ].join("|"),
    )
    .sort()
    .join("\n");
  let h = 5381;
  for (let i = 0; i < material.length; i += 1) {
    h = (h * 33) ^ material.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
}

// ── public: run a sync ───────────────────────────────────────
export async function syncInventory(): Promise<SyncResult> {
  const creds = readCreds();

  const rawAds = (await fetchAllAds(creds)).filter(isActive);

  const withImages = await mapPool(rawAds, IMAGE_CONCURRENCY, async (ad) => {
    const id = String(pick(ad, ["mobileAdId", "@key", "key", "adId"]) ?? "");
    // Search results contain a preview image only. Fetching the individual ad
    // supplies its complete image gallery and the full listing details.
    const details = id ? await fetchAdDetails(creds, id) : null;
    return mapAdToVehicle(ad, details);
  });

  const vehicles = withImages
    .filter((v) => v.id)
    .sort((a, b) => (b.price.raw || 0) - (a.price.raw || 0));

  const prev = await getSnapshot();
  const prevById = new Map((prev?.vehicles ?? []).map((v) => [v.id, v]));
  const nextIds = new Set(vehicles.map((v) => v.id));

  const added = vehicles.filter((v) => !prevById.has(v.id)).map((v) => v.id);
  const removed = [...prevById.keys()].filter((id) => !nextIds.has(id));
  const updated = vehicles
    .filter((v) => {
      const before = prevById.get(v.id);
      if (!before) return false;
      return (
        before.price.raw !== v.price.raw ||
        before.mileage.raw !== v.mileage.raw ||
        before.images.main !== v.images.main ||
        before.images.gallery.length !== v.images.gallery.length ||
        before.fullName !== v.fullName
      );
    })
    .map((v) => v.id);

  const nextHash = contentHash(vehicles);
  const lastSync = new Date().toISOString();
  const changed =
    !prev || prev.hash !== nextHash || added.length > 0 || removed.length > 0;

  const snapshot: InventorySnapshot = { vehicles, lastSync, hash: nextHash };

  if (changed) {
    await setSnapshot(snapshot);
  } else if (prev) {
    // touch lastSync only, keep the (identical) vehicle array
    await setSnapshot({ ...prev, lastSync });
  }

  return {
    changed,
    count: vehicles.length,
    added,
    removed,
    updated,
    lastSync,
    source: "mobile.de",
  };
}
