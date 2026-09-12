import Image from "next/image";
import { cn } from "@/lib/cn";

interface LogoProps {
  light?: boolean;
  className?: string;
}

export function Logo({ light, className }: LogoProps) {
  return (
    <Image
      src={light ? "/logo-white.png" : "/logo.png"}
      alt="HF E-Autos"
      width={1785}
      height={288}
      priority
      className={cn(
        "h-8 w-auto sm:h-9",
        light && "drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]",
        className,
      )}
    />
  );
}
