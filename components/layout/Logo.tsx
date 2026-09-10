import { cn } from "@/lib/cn";

interface LogoProps {
  light?: boolean;
  className?: string;
}

export function Logo({ light, className }: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-[0.14em] text-lg font-semibold tracking-tight sm:text-xl",
        light ? "text-white" : "text-[var(--color-fg)]",
        className,
      )}
      aria-label="HF E-Autos"
    >
      <span className={light ? "text-white" : "text-[var(--color-accent)]"}>
        HF
      </span>
      <span>E-Autos</span>
    </span>
  );
}
