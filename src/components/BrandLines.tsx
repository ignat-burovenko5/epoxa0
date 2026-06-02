import { siteConfig } from "@/lib/site";

const brandNameClass = "font-serif font-bold italic normal-case tracking-normal";

type BrandLinesVariant = "hero" | "default" | "compact";

type BrandLinesProps = {
  className?: string;
  variant?: BrandLinesVariant;
  /** @deprecated Use `variant` instead */
  size?: "default" | "compact";
  /** @deprecated Use `variant` instead */
  lineClassName?: string;
};

export function BrandName({ className = brandNameClass }: { className?: string }) {
  return <span className={className}>{siteConfig.name}</span>;
}

export default function BrandLines({
  className = "",
  variant,
  size,
  lineClassName,
}: BrandLinesProps) {
  const resolved: BrandLinesVariant =
    variant ?? (size === "compact" ? "compact" : "default");

  if (resolved === "hero") {
    return (
      <div
        className={`brand-hero ${className}`}
        aria-label={`${siteConfig.descriptor} ${siteConfig.name}`}
      >
        <p className="brand-hero__descriptor font-sans text-[0.6875rem] sm:text-xs tracking-[0.32em] uppercase text-accent-gold/75">
          {siteConfig.descriptor}
        </p>
        <p className="brand-hero__name font-serif font-semibold italic leading-[0.88] tracking-[-0.01em]">
          <span className="brand-hero__name-under" aria-hidden="true">
            {siteConfig.name}
          </span>
          <span className="brand-hero__name-face" aria-hidden="true">
            {siteConfig.name}
          </span>
        </p>
        <span className="brand-hero__rule" aria-hidden="true" />
      </div>
    );
  }

  if (resolved === "compact") {
    return (
      <div
        className={`flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${className}`}
        aria-label={`${siteConfig.descriptor} ${siteConfig.name}`}
      >
        <span className="font-sans text-sm uppercase tracking-[0.22em] text-accent-gold/80">
          {siteConfig.descriptor}
        </span>
        <BrandName className="font-serif text-xl sm:text-2xl leading-none font-semibold italic text-accent-gold" />
      </div>
    );
  }

  const descriptorClass =
    lineClassName ??
    "font-sans text-[1.125rem] leading-none tracking-[0.14em] uppercase text-accent-gold/85";
  const nameClass =
    lineClassName != null
      ? brandNameClass
      : "font-serif text-2xl sm:text-3xl leading-none font-semibold italic text-accent-gold";

  return (
    <div
      className={`flex flex-wrap items-baseline gap-x-2.5 gap-y-1 ${className}`}
      aria-label={`${siteConfig.descriptor} ${siteConfig.name}`}
    >
      <span className={descriptorClass}>{siteConfig.descriptor}</span>
      <BrandName className={nameClass} />
    </div>
  );
}
