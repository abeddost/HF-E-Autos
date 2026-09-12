import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

interface Cta {
  label: string;
  href: string;
  external?: boolean;
}

interface FullBleedSectionProps {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  primaryCta?: Cta;
  secondaryCta?: Cta;
  bgImage?: string;
  /** solid background colour when no image is used */
  bg?: "light" | "alt" | "dark";
  /** text colour treatment */
  theme?: "light" | "dark";
  align?: "center" | "left";
  /** vertical placement of the copy block */
  anchor?: "center" | "bottom";
  minHeight?: "screen" | "tall" | "auto";
  priority?: boolean;
  overlay?: boolean;
  children?: ReactNode;
}

export function FullBleedSection({
  id,
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  bgImage,
  bg = "light",
  theme = bgImage ? "dark" : "light",
  align = "center",
  anchor = bgImage ? "bottom" : "center",
  minHeight = "screen",
  priority = false,
  overlay = true,
  children,
}: FullBleedSectionProps) {
  const heightClass =
    minHeight === "screen"
      ? "min-h-[100svh]"
      : minHeight === "tall"
        ? "min-h-[80svh]"
        : "py-24 md:py-32";

  const bgClass = bgImage
    ? ""
    : bg === "dark"
      ? "bg-[var(--color-bg-dark)]"
      : bg === "alt"
        ? "bg-[var(--color-bg-alt)]"
        : "bg-[var(--color-bg)]";

  const textClass = theme === "dark" ? "text-white" : "text-[var(--color-fg)]";

  return (
    <section
      id={id}
      className={cn(
        "relative isolate flex w-full flex-col overflow-hidden",
        heightClass,
        bgClass,
        textClass,
        anchor === "bottom" ? "justify-end" : "justify-center",
      )}
    >
      {bgImage ? (
        <>
          <Image
            src={bgImage}
            alt=""
            fill
            priority={priority}
            sizes="100vw"
            className="-z-10 object-cover"
          />
          {overlay ? (
            <div
              className="absolute inset-0 -z-10 bg-gradient-to-b from-black/40 via-black/20 to-black/75"
              aria-hidden
            />
          ) : null}
        </>
      ) : null}

      <div
        className={cn(
          "mx-auto w-full max-w-[1400px] px-6 lg:px-10",
          anchor === "bottom" ? "pb-16 pt-28 md:pb-24" : "py-28",
        )}
      >
        <Reveal
          className={cn(
            "flex w-full flex-col gap-5",
            align === "center" ? "items-center text-center" : "items-start text-left",
            theme === "dark" && bgImage && "[text-shadow:0_1px_16px_rgb(0_0_0_/_0.55)]",
          )}
        >
          {eyebrow ? (
            <p className="label-caps opacity-80">{eyebrow}</p>
          ) : null}
          <h2
            className={cn(
              "w-full max-w-4xl text-[length:var(--text-h2)] font-medium leading-[var(--text-h2--line-height)] [text-wrap:balance]",
              align === "center" && "mx-auto",
            )}
          >
            {title}
          </h2>
          {subtitle ? (
            <p
              className={cn(
                "w-full max-w-xl text-base leading-relaxed md:text-lg",
                align === "center" && "mx-auto",
                theme === "dark" ? "text-white/90" : "text-[var(--color-muted)]",
              )}
            >
              {subtitle}
            </p>
          ) : null}

          {children}

          {primaryCta || secondaryCta ? (
            <div
              className={cn(
                "mt-3 flex flex-col gap-3 sm:flex-row",
                align === "center" && "justify-center",
              )}
            >
              {primaryCta ? (
                <Button
                  href={primaryCta.href}
                  external={primaryCta.external}
                  variant="primary"
                >
                  {primaryCta.label}
                </Button>
              ) : null}
              {secondaryCta ? (
                <Button
                  href={secondaryCta.href}
                  external={secondaryCta.external}
                  variant={theme === "dark" ? "ghostLight" : "secondary"}
                >
                  {secondaryCta.label}
                </Button>
              ) : null}
            </div>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
