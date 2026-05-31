import { siteConfig } from "@/lib/site";

const brandNameClass = "font-serif font-bold italic normal-case tracking-normal";

type BrandLinesSize = "default" | "compact";

const sizeStyles: Record<
  BrandLinesSize,
  { descriptor: string; name: string; gap: string }
> = {
  default: {
    gap: "gap-x-2.5 gap-y-0.5",
    descriptor:
      "font-sans text-[1.25rem] leading-none tracking-[0.12em] uppercase text-accent-gold",
    name: "font-serif text-[1.25rem] leading-none font-bold italic text-accent-gold",
  },
  compact: {
    gap: "gap-x-2 gap-y-0.5",
    descriptor:
      "font-sans text-[1.125rem] leading-none uppercase tracking-[0.25em] text-accent-gold",
    name: "font-serif text-[1.125rem] leading-none font-bold italic text-accent-gold",
  },
};

type BrandLinesProps = {
  className?: string;
  size?: BrandLinesSize;
  /** @deprecated Use `size` instead */
  lineClassName?: string;
};

export function BrandName({ className = brandNameClass }: { className?: string }) {
  return <span className={className}>{siteConfig.name}</span>;
}

export default function BrandLines({
  className = "",
  size = "default",
  lineClassName,
}: BrandLinesProps) {
  const styles = sizeStyles[size];
  const descriptorClass = lineClassName ?? styles.descriptor;

  return (
    <div
      className={`flex flex-wrap items-baseline ${styles.gap} ${className}`}
      aria-label={`${siteConfig.descriptor} ${siteConfig.name}`}
    >
      <span className={descriptorClass}>{siteConfig.descriptor}</span>
      <BrandName className={lineClassName ? brandNameClass : styles.name} />
    </div>
  );
}
