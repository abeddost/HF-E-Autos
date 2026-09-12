"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { Vehicle } from "@/lib/types";

const ROTATE_MS = 6000;
const FADE_MS = 300;
const SWIPE_THRESHOLD = 40;

interface FeaturedVehicleShowcaseProps {
  vehicles: Vehicle[];
}

export function FeaturedVehicleShowcase({ vehicles }: FeaturedVehicleShowcaseProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const rotateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const vehicle = vehicles[index];
  const gallery = vehicle
    ? vehicle.images.gallery.length > 0
      ? vehicle.images.gallery
      : vehicle.images.main
        ? [vehicle.images.main]
        : []
    : [];

  // reset to the first photo whenever the featured vehicle changes
  useEffect(() => {
    setPhotoIndex(0);
  }, [index]);

  // (re)schedule the next auto-rotation, pushing it back on any user interaction
  const scheduleRotate = useCallback(() => {
    if (rotateTimer.current) clearTimeout(rotateTimer.current);
    if (vehicles.length < 2) return;
    rotateTimer.current = setTimeout(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % vehicles.length);
        setVisible(true);
      }, FADE_MS);
    }, ROTATE_MS);
  }, [vehicles.length]);

  useEffect(() => {
    scheduleRotate();
    return () => {
      if (rotateTimer.current) clearTimeout(rotateTimer.current);
    };
  }, [scheduleRotate, index]);

  if (!vehicle) return null;

  const goTo = (i: number) => {
    if (i === index) return;
    setVisible(false);
    window.setTimeout(() => {
      setIndex(i);
      setVisible(true);
    }, FADE_MS);
  };

  const prevPhoto = () => {
    setPhotoIndex((p) => (p - 1 + gallery.length) % gallery.length);
    scheduleRotate();
  };
  const nextPhoto = () => {
    setPhotoIndex((p) => (p + 1) % gallery.length);
    scheduleRotate();
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > SWIPE_THRESHOLD) prevPhoto();
    else if (delta < -SWIPE_THRESHOLD) nextPhoto();
    touchStartX.current = null;
  };

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-24 md:py-32 lg:px-10">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div
          className={cn(
            "group relative aspect-[4/3] w-full touch-pan-y select-none overflow-hidden rounded-2xl bg-[var(--color-bg-alt)] transition-opacity duration-300 ease-[var(--ease-out-soft)]",
            visible ? "opacity-100" : "opacity-0",
          )}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {gallery[photoIndex] ? (
            <Image
              key={gallery[photoIndex]}
              src={gallery[photoIndex]}
              alt={vehicle.fullName}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : null}

          {gallery.length > 1 ? (
            <>
              <button
                type="button"
                onClick={prevPhoto}
                aria-label="Vorheriges Foto"
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[var(--color-fg)] opacity-0 shadow transition-opacity duration-200 hover:bg-white focus-visible:opacity-100 group-hover:opacity-100"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M15 5l-7 7 7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={nextPhoto}
                aria-label="Nächstes Foto"
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[var(--color-fg)] opacity-0 shadow transition-opacity duration-200 hover:bg-white focus-visible:opacity-100 group-hover:opacity-100"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M9 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1.5 backdrop-blur-sm">
                {gallery.map((src, i) => (
                  <span
                    key={src}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-200",
                      i === photoIndex ? "w-4 bg-white" : "w-1.5 bg-white/60",
                    )}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>

        <div
          className={cn(
            "transition-opacity duration-300 ease-[var(--ease-out-soft)]",
            visible ? "opacity-100" : "opacity-0",
          )}
        >
          <p className="label-caps text-[var(--color-muted)]">Aus unserem Bestand</p>
          <h2 className="mt-4 break-words text-[length:var(--text-h2)] font-medium leading-[var(--text-h2--line-height)] [text-wrap:balance]">
            {vehicle.fullName}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
            {[
              vehicle.price.formatted,
              vehicle.firstRegistration,
              vehicle.mileage.raw > 0 ? vehicle.mileage.formatted : null,
              vehicle.power.kw > 0 ? `${vehicle.power.ps} PS` : null,
              vehicle.fuel,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={`/unsere-angebote/${vehicle.slug}`} variant="primary">
              Fahrzeug ansehen
            </Button>
            <Button href="/unsere-angebote" variant="secondary">
              Alle Angebote
            </Button>
          </div>

          {vehicles.length > 1 ? (
            <div className="mt-8 flex items-center gap-2">
              {vehicles.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`${v.fullName} anzeigen`}
                  aria-current={i === index}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === index
                      ? "w-6 bg-[var(--color-accent)]"
                      : "w-1.5 bg-[var(--color-line)] hover:bg-[var(--color-muted)]",
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
