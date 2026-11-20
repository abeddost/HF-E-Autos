"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { site, whatsappLink } from "@/lib/site";

/** Slim vehicle shape passed from the server – keeps the client bundle small. */
export interface InquiryCar {
  slug: string;
  fullName: string;
  price: string;
  mileage: string;
  firstRegistration: string;
  thumb: string;
}

interface WhatsAppContactProps {
  cars: InquiryCar[];
  /** Slug of the car to preselect (e.g. on a vehicle detail page). */
  selectedSlug?: string;
}

const TOPICS = [
  "Probefahrt",
  "Finanzierung",
  "Inzahlungnahme",
  "Verfügbarkeit",
  "Allgemeine Frage",
] as const;

export function WhatsAppContact({ cars, selectedSlug }: WhatsAppContactProps) {
  const [slug, setSlug] = useState<string>(selectedSlug ?? "");
  const [topic, setTopic] = useState<string>("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const car = cars.find((c) => c.slug === slug);

  const text = useMemo(
    () => buildMessage({ car, topic, name, message }),
    [car, topic, name, message],
  );

  return (
    <div className="flex flex-col gap-5 rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-alt)] p-6 md:p-8">
      <div>
        <p className="text-lg font-medium">Anfrage per WhatsApp</p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Wählen Sie ein Fahrzeug – wir bereiten Ihre Nachricht vor, Sie
          müssen sie nur noch absenden.
        </p>
      </div>

      <CarPicker cars={cars} value={slug} onChange={setSlug} />

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Ihr Anliegen</legend>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => {
            const active = topic === t;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={active}
                onClick={() => setTopic(active ? "" : t)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-[var(--color-fg)] bg-[var(--color-fg)] text-white"
                    : "border-[var(--color-line)] bg-white hover:border-[var(--color-fg)]/40"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Ihr Name (optional)</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className="rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5 text-base outline-none focus:border-[var(--color-accent)]"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Nachricht (optional)</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder={
            car
              ? `Ist der ${car.fullName} noch verfügbar?`
              : "Wie können wir Ihnen helfen?"
          }
          className="resize-y rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5 text-base outline-none focus:border-[var(--color-accent)]"
        />
      </label>

      <div>
        <p className="mb-2 text-sm font-medium">Vorschau Ihrer Nachricht</p>
        <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-lg rounded-tl-none bg-[#dcf8c6] px-4 py-3 font-sans text-sm leading-relaxed text-[#111]">
          {text}
        </pre>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={whatsappLink(text)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-center text-sm font-medium uppercase tracking-[0.06em] text-white transition-colors hover:bg-[#1ebe5a]"
        >
          <WhatsAppIcon />
          Per WhatsApp senden
        </a>
        <a
          href={`tel:${site.phone.tel}`}
          className="flex-1 rounded-full border border-[var(--color-fg)]/25 bg-white px-6 py-3.5 text-center text-sm font-medium uppercase tracking-[0.06em] transition-colors hover:bg-[var(--color-bg-alt)]"
        >
          Anrufen · {site.phone.display}
        </a>
      </div>
    </div>
  );
}

function buildMessage({
  car,
  topic,
  name,
  message,
}: {
  car?: InquiryCar;
  topic: string;
  name: string;
  message: string;
}): string {
  const lines: string[] = [`Hallo ${site.name},`, ""];

  if (car) {
    lines.push("ich interessiere mich für folgendes Fahrzeug:");
    lines.push(`🚗 ${car.fullName}`);
    lines.push(
      [car.price, car.firstRegistration && `EZ ${car.firstRegistration}`, car.mileage]
        .filter(Boolean)
        .join(" · "),
    );
    lines.push(`${site.url}/unsere-angebote/${car.slug}`);
  } else {
    lines.push("ich habe eine Anfrage.");
  }

  if (topic) lines.push("", `Anliegen: ${topic}`);
  if (message.trim()) lines.push("", message.trim());
  if (name.trim()) lines.push("", `Viele Grüße`, name.trim());

  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/* Car picker: accessible listbox dropdown with thumbnails            */
/* ------------------------------------------------------------------ */

function CarPicker({
  cars,
  value,
  onChange,
}: {
  cars: InquiryCar[];
  value: string;
  onChange: (slug: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  // "" = no specific car, listed first.
  const options = useMemo(() => ["", ...cars.map((c) => c.slug)], [cars]);
  const selected = cars.find((c) => c.slug === value);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function openList() {
    setActive(Math.max(0, options.indexOf(value)));
    setOpen(true);
  }

  function choose(index: number) {
    onChange(options[index]);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onListKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(active);
    } else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
      if (e.key === "Escape") buttonRef.current?.focus();
    }
  }

  return (
    <div ref={rootRef} className="relative text-sm">
      <span id={`${id}-label`} className="mb-1.5 block font-medium">
        Fahrzeug
      </span>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openList();
          }
        }}
        className="flex w-full items-center gap-3 rounded-md border border-[var(--color-line)] bg-white p-2 pr-3 text-left outline-none focus:border-[var(--color-accent)]"
      >
        <span id={`${id}-value`} className="flex min-w-0 flex-1 items-center gap-3">
          {selected ? <CarRow car={selected} /> : <NoCarRow />}
        </span>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className={`h-4 w-4 shrink-0 fill-current text-[var(--color-muted)] transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4z" />
        </svg>
      </button>

      {open ? (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={`${id}-label`}
          aria-activedescendant={`${id}-opt-${active}`}
          onKeyDown={onListKey}
          className="absolute z-30 mt-1 max-h-80 w-full overflow-auto rounded-md border border-[var(--color-line)] bg-white p-1 shadow-lg outline-none"
        >
          {options.map((optSlug, i) => {
            const c = cars.find((x) => x.slug === optSlug);
            const isSelected = optSlug === value;
            return (
              <li
                key={optSlug || "none"}
                id={`${id}-opt-${i}`}
                data-index={i}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(i)}
                className={`flex cursor-pointer items-center gap-3 rounded p-2 ${
                  i === active ? "bg-[var(--color-bg-alt)]" : ""
                } ${isSelected ? "font-medium" : ""}`}
              >
                {c ? <CarRow car={c} /> : <NoCarRow />}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function CarRow({ car }: { car: InquiryCar }) {
  return (
    <>
      <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-[var(--color-bg-alt)]">
        {car.thumb ? (
          <Image src={car.thumb} alt="" fill sizes="64px" className="object-cover" />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate">{car.fullName}</span>
        <span className="block truncate text-xs text-[var(--color-muted)]">
          {[car.price, car.firstRegistration && `EZ ${car.firstRegistration}`, car.mileage]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </span>
    </>
  );
}

function NoCarRow() {
  return (
    <>
      <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded bg-[var(--color-bg-alt)] text-lg text-[var(--color-muted)]">
        ?
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate">Kein bestimmtes Fahrzeug</span>
        <span className="block truncate text-xs text-[var(--color-muted)]">
          Allgemeine Anfrage
        </span>
      </span>
    </>
  );
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.24-9.44 9.45-9.44a9.38 9.38 0 0 1 9.43 9.45c0 5.2-4.24 9.43-9.45 9.43m8.04-17.47A11.3 11.3 0 0 0 12.05.7C5.78.7.68 5.8.68 12.06c0 2 .52 3.96 1.52 5.68L.6 23.6l6-1.57a11.33 11.33 0 0 0 5.44 1.39h.01c6.26 0 11.36-5.1 11.36-11.36 0-3.03-1.18-5.89-3.32-8.03" />
    </svg>
  );
}
