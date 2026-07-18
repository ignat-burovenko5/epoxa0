import { ArrowSquareUpRightIcon, LocationIcon } from "@/components/NavContactIcons";
import {
  siteConfig,
  yandexMapsUrl,
  yandexStaticMapSrc,
} from "@/lib/site";

type YandexSalonMapProps = {
  className?: string;
  /** dark — info/legal pages; light — checkout and product */
  variant?: "dark" | "light";
  compact?: boolean;
  showAddress?: boolean;
  heading?: string;
};

const linkClass = {
  dark: "text-accent-gold hover:text-museum-light",
  light: "text-accent-brass hover:text-luxury-charcoal",
} as const;

const borderClass = {
  dark: "border-museum-light/12 bg-museum-light/[0.02]",
  light: "border-luxury-charcoal/12 bg-museum-warm/40",
} as const;

const textClass = {
  dark: "text-museum-light/75",
  light: "text-luxury-charcoal/70",
} as const;

export default function YandexSalonMap({
  className = "",
  variant = "dark",
  compact = false,
  showAddress = true,
  heading,
}: YandexSalonMapProps) {
  const mapsUrl = yandexMapsUrl();
  const width = compact ? 520 : 650;
  const height = compact ? 280 : 400;
  const mapSrc = yandexStaticMapSrc(width, height);

  return (
    <section
      className={`not-prose ${className}`.trim()}
      aria-label="Карта проезда к салону"
    >
      {heading ? (
        <p
          className={`mb-3 font-sans text-[10px] uppercase tracking-[0.2em] ${
            variant === "dark" ? "text-accent-gold/85" : "text-luxury-charcoal/50"
          }`}
        >
          {heading}
        </p>
      ) : null}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`group block overflow-hidden rounded-sm border ${borderClass[variant]} focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent-gold/60`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Yandex static map URL */}
        <img
          src={mapSrc}
          alt={`Карта: салон «${siteConfig.name}», ${siteConfig.addressLine}`}
          width={width}
          height={height}
          className={`block w-full h-auto object-cover transition-opacity duration-300 group-hover:opacity-90 ${
            compact ? "max-h-[min(280px,50vh)]" : "max-h-[min(400px,70vh)]"
          }`}
          loading="lazy"
          decoding="async"
        />
      </a>
      {showAddress ? (
        <p className={`mt-4 flex items-start gap-2 font-sans text-sm leading-relaxed ${textClass[variant]}`}>
          <LocationIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-brass" />
          <span>{siteConfig.addressLine}</span>
        </p>
      ) : null}
      <p className="mt-3">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 min-h-11 py-2 font-sans text-xs tracking-widest uppercase transition-colors ${linkClass[variant]}`}
        >
          <span>Открыть в Яндекс Картах</span>
          <ArrowSquareUpRightIcon className="h-4 w-4 shrink-0" />
        </a>
      </p>
    </section>
  );
}
