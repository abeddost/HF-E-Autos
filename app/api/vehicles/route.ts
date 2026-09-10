import { NextResponse } from "next/server";
import { getVehicles } from "@/lib/vehicles";

export const dynamic = "force-dynamic";

export async function GET() {
  const { vehicles, lastSync, source } = await getVehicles();
  return NextResponse.json(
    { vehicles, lastSync, source, count: vehicles.length },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
