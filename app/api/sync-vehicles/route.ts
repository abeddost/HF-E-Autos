import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import {
  MobileDeApiError,
  MobileDeConfigError,
  isMobileDeConfigured,
  syncInventory,
} from "@/lib/mobileDe";
import { getSnapshot, storageBackend } from "@/lib/store";
import { VEHICLES_TAG } from "@/lib/vehicles";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function extractToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  const header = req.headers.get("x-sync-secret");
  if (header) return header.trim();
  const query = req.nextUrl.searchParams.get("token");
  if (query) return query.trim();
  return null;
}

function authorize(req: NextRequest): boolean {
  const secrets = [process.env.SYNC_SECRET, process.env.CRON_SECRET].filter(
    (s): s is string => Boolean(s && s.length > 0),
  );
  if (secrets.length === 0) return true; // no secret configured → open
  const token = extractToken(req);
  return token != null && secrets.includes(token);
}

async function status() {
  const snapshot = await getSnapshot();
  return {
    count: snapshot?.vehicles.length ?? 0,
    lastSync: snapshot?.lastSync ?? null,
    storage: storageBackend(),
    mobileDeConfigured: isMobileDeConfigured(),
  };
}

async function runSync() {
  const result = await syncInventory();
  if (result.changed) {
    revalidateTag(VEHICLES_TAG);
    revalidatePath("/");
    revalidatePath("/unsere-angebote");
  }
  return result;
}

function handleError(error: unknown) {
  if (error instanceof MobileDeConfigError) {
    return NextResponse.json(
      { ok: false, error: error.message, code: "NOT_CONFIGURED" },
      { status: 503 },
    );
  }
  if (error instanceof MobileDeApiError) {
    return NextResponse.json(
      { ok: false, error: error.message, code: "UPSTREAM_ERROR" },
      { status: 502 },
    );
  }
  console.error("[sync-vehicles] unexpected error:", error);
  return NextResponse.json(
    { ok: false, error: "Unerwarteter Fehler beim Sync." },
    { status: 500 },
  );
}

export async function GET(req: NextRequest) {
  const wantsSync =
    req.nextUrl.searchParams.get("sync") === "1" ||
    req.nextUrl.searchParams.has("sync");

  if (!wantsSync) {
    return NextResponse.json({ ok: true, ...(await status()) });
  }

  if (!authorize(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json({ ok: true, ...(await runSync()) });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json({ ok: true, ...(await runSync()) });
  } catch (error) {
    return handleError(error);
  }
}
