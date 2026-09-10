import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghostLight";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium uppercase tracking-[0.06em] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60";

const sizes: Record<Size, string> = {
  md: "px-6 py-3 text-[0.8125rem]",
  lg: "px-8 py-4 text-sm",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]",
  secondary:
    "border border-[var(--color-fg)]/25 bg-white/80 text-[var(--color-fg)] backdrop-blur hover:bg-white",
  ghostLight:
    "border border-white/70 bg-white/5 text-white backdrop-blur hover:bg-white hover:text-[var(--color-fg)]",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof CommonProps | "href"> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof CommonProps> & {
    href: string;
    external?: boolean;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(
    base,
    sizes[size],
    variants[variant],
    fullWidth && "w-full",
    className,
  );

  if ("href" in rest && typeof rest.href === "string") {
    const { href, external, ...anchorProps } = rest as Omit<
      ButtonAsLink,
      keyof CommonProps
    >;
    const isExternalScheme =
      external ||
      href.startsWith("http") ||
      href.startsWith("tel:") ||
      href.startsWith("mailto:") ||
      href.startsWith("#");
    if (isExternalScheme) {
      return (
        <a
          href={href}
          className={classes}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          {...anchorProps}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = rest as Omit<
    ButtonAsButton,
    keyof CommonProps
  >;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
