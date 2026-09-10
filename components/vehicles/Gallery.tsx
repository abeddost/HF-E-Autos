"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";

interface GalleryProps {
  images: string[];
  alt: string;
}

export function Gallery({ images, alt }: GalleryProps) {
  const [index, setIndex] = useState(0);
  const count = images.length;

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(index - 1);
      if (e.key === "ArrowRight") go(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  if (count === 0) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-xl bg-[var(--color-bg-alt)] text-sm text-[var(--color-muted)]">
        Keine Bilder verfügbar
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="group relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[var(--color-bg-alt)]"
        onTouchStart={(e) => {
          (e.currentTarget as HTMLElement).dataset.x = String(e.touches[0].clientX);
        }}
        onTouchEnd={(e) => {
          const start = Number((e.currentTarget as HTMLElement).dataset.x ?? 0);
          const delta = e.changedTouches[0].clientX - start;
          if (Math.abs(delta) > 40) go(index + (delta < 0 ? 1 : -1));
        }}
      >
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={i === index ? alt : ""}
            fill
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, 66vw"
            className={cn(
              "object-cover transition-opacity duration-500",
              i === index ? "opacity-100" : "opacity-0",
            )}
          />
        ))}

        {count > 1 ? (
          <>
            <GalleryButton side="left" onClick={() => go(index - 1)} />
            <GalleryButton side="right" onClick={() => go(index + 1)} />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white">
              {index + 1} / {count}
            </div>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <div className="scrollbar-slim flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => go(i)}
              className={cn(
                "relative aspect-[4/3] h-16 shrink-0 overflow-hidden rounded-md bg-[var(--color-bg-alt)] transition-opacity",
                i === index
                  ? "ring-2 ring-[var(--color-accent)]"
                  : "opacity-60 hover:opacity-100",
              )}
              aria-label={`Bild ${i + 1} anzeigen`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="100px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function GalleryButton({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Vorheriges Bild" : "Nächstes Bild"}
      className={cn(
        "absolute top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[var(--color-fg)] opacity-0 transition-opacity group-hover:opacity-100 md:flex",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d={side === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
