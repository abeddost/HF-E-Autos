"use client";

import { useState } from "react";
import { site, whatsappLink } from "@/lib/site";

interface ContactFormProps {
  vehicleName?: string;
  vehicleUrl?: string;
}

type Status = "idle" | "sending" | "success" | "error" | "disabled";

export function ContactForm({ vehicleName, vehicleUrl }: ContactFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          message: data.get("message"),
          company: data.get("company"), // honeypot
          vehicleName,
          vehicleUrl,
        }),
      });

      if (res.ok) {
        setStatus("success");
        form.reset();
        return;
      }

      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        code?: string;
      };
      if (res.status === 501 || body.code === "EMAIL_DISABLED") {
        setStatus("disabled");
        return;
      }
      setStatus("error");
      setError(body.error ?? "Die Nachricht konnte nicht gesendet werden.");
    } catch {
      setStatus("error");
      setError("Netzwerkfehler. Bitte versuchen Sie es erneut.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-alt)] p-8 text-center">
        <p className="text-lg font-medium">Vielen Dank für Ihre Nachricht.</p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Wir melden uns schnellstmöglich bei Ihnen – in der Regel innerhalb eines
          Werktags.
        </p>
      </div>
    );
  }

  if (status === "disabled") {
    return (
      <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-alt)] p-8">
        <p className="font-medium">
          Das Kontaktformular ist derzeit nicht aktiv.
        </p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Bitte kontaktieren Sie uns direkt – wir helfen Ihnen gern weiter.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <a
            href={`tel:${site.phone.tel}`}
            className="rounded-full bg-[var(--color-fg)] px-6 py-3 text-center text-sm font-medium uppercase tracking-[0.06em] text-white"
          >
            {site.phone.display}
          </a>
          <a
            href={`mailto:${site.email}${
              vehicleName ? `?subject=${encodeURIComponent(`Anfrage: ${vehicleName}`)}` : ""
            }`}
            className="rounded-full border border-[var(--color-fg)]/25 px-6 py-3 text-center text-sm font-medium uppercase tracking-[0.06em]"
          >
            E-Mail schreiben
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {vehicleName ? (
        <p className="rounded-md bg-[var(--color-bg-alt)] px-4 py-3 text-sm">
          Ihre Anfrage bezieht sich auf:{" "}
          <span className="font-medium">{vehicleName}</span>
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Name" autoComplete="name" required />
        <Field
          name="email"
          label="E-Mail"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <Field name="phone" label="Telefon (optional)" type="tel" autoComplete="tel" />

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Nachricht</span>
        <textarea
          name="message"
          required
          rows={5}
          className="resize-y rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5 text-base outline-none focus:border-[var(--color-accent)]"
          placeholder={
            vehicleName
              ? `Ich interessiere mich für den ${vehicleName} und hätte folgende Frage …`
              : "Wie können wir Ihnen helfen?"
          }
        />
      </label>

      {/* honeypot */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      {status === "error" ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}

      <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-[var(--color-accent)] px-7 py-3 text-sm font-medium uppercase tracking-[0.06em] text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
        >
          {status === "sending" ? "Wird gesendet …" : "Nachricht senden"}
        </button>
        <a
          href={whatsappLink(
            vehicleName
              ? `Hallo ${site.name}, ich interessiere mich für den ${vehicleName}: ${vehicleUrl ?? ""}`
              : `Hallo ${site.name}, ich habe eine Frage.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-[var(--color-fg)]/25 px-7 py-3 text-center text-sm font-medium uppercase tracking-[0.06em] hover:bg-[var(--color-bg-alt)]"
        >
          Per WhatsApp
        </a>
      </div>

      <p className="text-xs text-[var(--color-muted)]">
        Mit dem Absenden stimmen Sie der Verarbeitung Ihrer Angaben zur
        Bearbeitung der Anfrage zu. Details in der{" "}
        <a href="/datenschutz" className="underline underline-offset-2">
          Datenschutzerklärung
        </a>
        .
      </p>
    </form>
  );
}

interface FieldProps {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}

function Field({ name, label, type = "text", required, autoComplete }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5 text-base outline-none focus:border-[var(--color-accent)]"
      />
    </label>
  );
}
