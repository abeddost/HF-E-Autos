import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getVehicles } from "@/lib/vehicles";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: `${base}/unsere-angebote`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    { url: `${base}/leistungen`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/ueber-uns`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/kontakt`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/impressum`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/datenschutz`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const { vehicles } = await getVehicles();
    const vehicleRoutes: MetadataRoute.Sitemap = vehicles.map((v) => ({
      url: `${base}/unsere-angebote/${v.slug}`,
      lastModified: v.updatedAt ? new Date(v.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
    return [...staticRoutes, ...vehicleRoutes];
  } catch {
    return staticRoutes;
  }
}
