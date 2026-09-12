/**
 * Central configuration for HF E-Autos.
 * Values marked «…» are placeholders the dealer still needs to supply.
 */

export interface OpeningHour {
  days: string;
  hours: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface ServiceItem {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  image: string;
}

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://hf-eautos.de";

export const site = {
  name: "HF E-Autos",
  legalName: "HF E-Autos",
  owner: "Hamza Sarwari",
  ownerRole: "Inhaber",
  tagline: "Die Zukunft fährt elektrisch",
  description:
    "HF E-Autos in Wiesbaden – geprüfte Elektro- und Plug-in-Hybrid-Gebrauchtwagen mit Batterie-Check, Garantie und transparenter Historie. Bestand täglich aktuell.",
  url: siteUrl,
  locale: "de-DE",

  address: {
    street: "Boelckestraße 58A",
    zip: "55252",
    city: "Wiesbaden",
    country: "Deutschland",
    countryCode: "DE",
  },

  /** optional – fill in for the map / LocalBusiness geo */
  geo: {
    lat: null as number | null,
    lng: null as number | null,
  },

  phone: {
    display: "+49 176 72673140",
    tel: "+4917672673140",
  },
  whatsapp: "4917672673140",
  email: "info@hf-eautos.de",

  openingHours: [
    { days: "Montag – Samstag", hours: "09:00 – 18:00 Uhr" },
    { days: "Sonntag", hours: "geschlossen" },
  ] as OpeningHour[],

  social: {
    instagram: "",
    facebook: "",
  },

  impressum: {
    // Einzelunternehmen – kein HRB / Registergericht / Geschäftsführer
    responsible: "Hamza Sarwari",
    ustId: "«USt-IdNr. gemäß §27a UStG»",
    /** Plattform der EU-Kommission zur Online-Streitbeilegung */
    odrNote: true,
  },

  nav: [
    { label: "Bestand", href: "/unsere-angebote" },
    { label: "Leistungen", href: "/leistungen" },
    { label: "Über uns", href: "/ueber-uns" },
    { label: "Kontakt", href: "/kontakt" },
  ] as NavItem[],

  services: [
    {
      slug: "finanzierung-leasing",
      title: "Finanzierung & Leasing",
      excerpt:
        "Flexible Raten für Privat und Gewerbe – vom klassischen Ratenkredit bis zum Full-Service-Leasing.",
      body: [
        "Wir vermitteln die Finanzierung Ihres Elektro-Gebrauchtwagens über etablierte Bankpartner. Laufzeit, Anzahlung und Schlussrate stimmen wir gemeinsam auf Ihr Budget ab.",
        "Für Gewerbekunden bieten wir Leasingmodelle mit planbaren monatlichen Kosten und optionalem Wartungspaket. Sprechen Sie uns auf ein individuelles Angebot an.",
      ],
      image:
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=80",
    },
    {
      slug: "inzahlungnahme",
      title: "Inzahlungnahme",
      excerpt:
        "Bringen Sie Ihren aktuellen Wagen mit – wir bewerten ihn fair und rechnen ihn direkt an.",
      body: [
        "Ihr bisheriges Fahrzeug – ob Verbrenner oder Stromer – nehmen wir beim Kauf in Zahlung. Die Bewertung erfolgt transparent anhand von Zustand, Laufleistung und aktueller Marktlage.",
        "Der Anrechnungsbetrag wird unmittelbar mit dem Kaufpreis verrechnet. Vereinbaren Sie einen Termin zur Begutachtung vor Ort in Wiesbaden.",
      ],
      image:
        "https://images.unsplash.com/photo-1517672651691-24622a91b550?auto=format&fit=crop&w=1600&q=80",
    },
    {
      slug: "garantie-batterie-check",
      title: "Garantie & Batterie-Check",
      excerpt:
        "Jeder Stromer wird vor der Übergabe geprüft – inklusive Zustandsbericht zur Antriebsbatterie.",
      body: [
        "Vor der Auslieferung durchläuft jedes Fahrzeug eine technische Prüfung. Für die Hochvoltbatterie erstellen wir einen State-of-Health-Bericht, damit Sie die tatsächliche Restkapazität kennen.",
        "Auf Wunsch erweitern wir den Kauf um eine Gebrauchtwagengarantie mit Laufzeiten von 12 bis 36 Monaten.",
      ],
      image:
        "https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?auto=format&fit=crop&w=1600&q=80",
    },
    {
      slug: "wallbox-zulassung-werkstatt",
      title: "Wallbox, Zulassung & Werkstatt",
      excerpt:
        "Von der Heimladelösung über die Zulassung bis zur Wartung – wir übernehmen den Rundum-Service.",
      body: [
        "Wir beraten zur passenden Wallbox für Ihr Zuhause und vermitteln geprüfte Installationspartner in der Region Wiesbaden / Mainz.",
        "Die Zulassung und Überführung Ihres neuen Fahrzeugs erledigen wir auf Wunsch komplett. Für Inspektion, Reifen und Verschleißarbeiten an Elektrofahrzeugen arbeiten wir mit einer festen Partnerwerkstatt zusammen.",
      ],
      image:
        "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1600&q=80",
    },
  ] as ServiceItem[],

  footerColumns: [
    {
      title: "Fahrzeuge",
      links: [
        { label: "Alle Fahrzeuge", href: "/unsere-angebote" },
        { label: "Elektro", href: "/unsere-angebote?fuel=Elektro" },
        { label: "Plug-in-Hybrid", href: "/unsere-angebote?fuel=Plug-in-Hybrid" },
      ],
    },
    {
      title: "Unternehmen",
      links: [
        { label: "Über uns", href: "/ueber-uns" },
        { label: "Leistungen", href: "/leistungen" },
        { label: "Kontakt", href: "/kontakt" },
      ],
    },
    {
      title: "Rechtliches",
      links: [
        { label: "Impressum", href: "/impressum" },
        { label: "Datenschutz", href: "/datenschutz" },
      ],
    },
  ] as FooterColumn[],
} as const;

export type Site = typeof site;

export function whatsappLink(text?: string): string {
  const base = `https://wa.me/${site.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function mapsLink(): string {
  const q = encodeURIComponent(
    `${site.address.street}, ${site.address.zip} ${site.address.city}`,
  );
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function fullAddress(): string {
  return `${site.address.street}, ${site.address.zip} ${site.address.city}`;
}
