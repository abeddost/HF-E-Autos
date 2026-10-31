import { buildGoogleVehiclesFeed } from "@/lib/merchantFeed";
import { getVehicles } from "@/lib/vehicles";

export const dynamic = "force-dynamic";

export async function GET() {
  const { vehicles, source } = await getVehicles();
  // Never submit the demo fallback inventory to Merchant Center
  const xml = buildGoogleVehiclesFeed(source === "store" ? vehicles : []);
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
