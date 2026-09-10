import { NextResponse, type NextRequest } from "next/server";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

interface ContactPayload {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  vehicleName?: string;
  vehicleUrl?: string;
  /** honeypot – must stay empty */
  company?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// naive in-memory rate limit (best effort; resets on cold start)
const hits = new Map<string, { count: number; ts: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.ts > WINDOW_MS) {
    hits.set(ip, { count: 1, ts: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  let body: ContactPayload;
  try {
    body = (await req.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Ungültige Anfrage." },
      { status: 400 },
    );
  }

  // honeypot
  if (body.company && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const message = (body.message ?? "").trim();

  const errors: string[] = [];
  if (name.length < 2) errors.push("Bitte geben Sie Ihren Namen an.");
  if (!EMAIL_RE.test(email)) errors.push("Bitte geben Sie eine gültige E-Mail-Adresse an.");
  if (message.length < 10) errors.push("Bitte formulieren Sie eine kurze Nachricht.");
  if (errors.length > 0) {
    return NextResponse.json({ ok: false, error: errors.join(" ") }, { status: 422 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." },
      { status: 429 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || site.email;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !from) {
    return NextResponse.json(
      {
        ok: false,
        code: "EMAIL_DISABLED",
        error:
          "Das Kontaktformular ist derzeit nicht aktiv. Bitte kontaktieren Sie uns telefonisch oder per E-Mail.",
      },
      { status: 501 },
    );
  }

  const subjectVehicle = body.vehicleName ? ` – ${body.vehicleName}` : "";
  const lines = [
    `Name: ${name}`,
    `E-Mail: ${email}`,
    phone ? `Telefon: ${phone}` : null,
    body.vehicleName ? `Fahrzeug: ${body.vehicleName}` : null,
    body.vehicleUrl ? `Fahrzeug-Link: ${body.vehicleUrl}` : null,
    "",
    message,
  ].filter((l): l is string => l !== null);

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `Kontaktanfrage Website${subjectVehicle}`,
      text: lines.join("\n"),
      html: lines
        .map((l) => (l === "" ? "<br/>" : `<p>${escapeHtml(l)}</p>`))
        .join(""),
    });
    if (error) {
      console.error("[contact] resend error:", error);
      return NextResponse.json(
        { ok: false, error: "Nachricht konnte nicht gesendet werden." },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[contact] unexpected error:", error);
    return NextResponse.json(
      { ok: false, error: "Nachricht konnte nicht gesendet werden." },
      { status: 500 },
    );
  }
}
