import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

/** Transparent padding in source logo.png (1350×900); offset via .logo-artwork-offset in globals.css. */
const LOGO_WIDTH = 1350;
const LOGO_HEIGHT = 900;

type LogoProps = {
  className?: string;
  size?: "header" | "footer" | "footerCompact";
};

export default function Logo({ className = "", size = "header" }: LogoProps) {
  const heightClass =
    size === "footer"
      ? "h-[8.75rem] sm:h-[10rem] md:h-[11.25rem]"
      : size === "footerCompact"
        ? "h-12 sm:h-14 md:h-16"
        : "h-[6.875rem] sm:h-[7.5rem] md:h-[8.75rem]";

  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — на главную`}
      className={`inline-block leading-none shrink-0 ${className}`}
    >
      <Image
        src="/logo.png"
        alt={siteConfig.name}
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        sizes={
          size === "footerCompact"
            ? "(max-width: 768px) 160px, 192px"
            : size === "footer"
              ? "(max-width: 768px) 280px, 320px"
              : "(max-width: 768px) 180px, 280px"
        }
        quality={80}
        priority={size === "header"}
        fetchPriority={size === "header" ? "high" : "auto"}
        className={`logo-artwork-offset block w-auto object-contain object-left brightness-0 invert -translate-x-[calc(var(--logo-offset)*100%)] ${heightClass}`}
      />
    </Link>
  );
}
