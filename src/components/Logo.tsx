import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

/** Wordmark in footer (logo.png has side padding; offset via .logo-artwork-offset). */
const WORDMARK_WIDTH = 1350;
const WORDMARK_HEIGHT = 900;

/** Navbar mark — white on transparent PNG (scripts/extract-logo-mark.py). */
const NAV_LOGO_SRC = "/logo-mark.png";
/** Display size (asset is 512×511); HTML width/height avoid 512px layout before CSS. */
const NAV_LOGO_DISPLAY = { w: 160, h: 152 } as const;

type LogoProps = {
  className?: string;
  size?: "header" | "footer" | "footerCompact" | "footerMark";
};

export default function Logo({ className = "", size = "header" }: LogoProps) {
  const heightClass =
    size === "footer"
      ? "h-[8.75rem] sm:h-[10rem] md:h-[11.25rem]"
      : size === "footerCompact"
        ? "h-12 sm:h-14 md:h-16"
        : "";

  const isNavMark = size === "header" || size === "footerMark";

  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — на главную`}
      className={`${isNavMark ? "logo-nav-link w-fit max-w-full" : "inline-block leading-none"} shrink-0 cursor-pointer touch-manipulation hover:opacity-90 transition-opacity focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent-gold/70 ${className}`}
    >
      {isNavMark ? (
        <img
          src={NAV_LOGO_SRC}
          alt={siteConfig.name}
          width={NAV_LOGO_DISPLAY.w}
          height={NAV_LOGO_DISPLAY.h}
          decoding="async"
          fetchPriority={size === "header" ? "high" : "auto"}
          className={size === "footerMark" ? "logo-nav-mark logo-nav-mark--footer" : "logo-nav-mark"}
        />
      ) : (
        <Image
          src="/logo.png"
          alt={siteConfig.name}
          width={WORDMARK_WIDTH}
          height={WORDMARK_HEIGHT}
          sizes={
            size === "footerCompact"
              ? "(max-width: 768px) 160px, 192px"
              : "(max-width: 768px) 280px, 320px"
          }
          quality={80}
          className={`logo-artwork-offset block w-auto object-contain object-left brightness-0 invert -translate-x-[calc(var(--logo-offset)*100%)] ${heightClass}`}
        />
      )}
    </Link>
  );
}
