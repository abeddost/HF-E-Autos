import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70svh] flex-col items-center justify-center px-6 text-center">
      <p className="label-caps text-[var(--color-muted)]">Fehler 404</p>
      <h1 className="mt-4 text-[length:var(--text-h2)] font-medium leading-[var(--text-h2--line-height)]">
        Seite nicht gefunden
      </h1>
      <p className="mt-4 max-w-md text-[var(--color-muted)]">
        Die aufgerufene Seite existiert nicht oder das Fahrzeug wurde
        zwischenzeitlich verkauft.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href="/unsere-angebote">Zu den Fahrzeugen</Button>
        <Button href="/" variant="secondary">
          Zur Startseite
        </Button>
      </div>
      <Link
        href="/kontakt"
        className="mt-6 text-sm text-[var(--color-accent)] underline underline-offset-4"
      >
        Kontakt aufnehmen
      </Link>
    </div>
  );
}
