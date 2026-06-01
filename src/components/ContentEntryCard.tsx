import Link from "next/link";
import type { ContentEntrySummary } from "@/lib/content";

type ContentEntryCardProps = {
  entry: ContentEntrySummary;
};

export default function ContentEntryCard({ entry }: ContentEntryCardProps) {
  return (
    <article className="border-b border-museum-light/10 pb-8 last:border-0">
      {entry.date ? (
        <time
          dateTime={entry.date.split(".").reverse().join("-")}
          className="font-sans text-xs tracking-widest uppercase text-accent-gold/80 mb-2 block"
        >
          {entry.date}
        </time>
      ) : null}
      <h2 className="font-serif text-xl md:text-2xl text-museum-light mb-3">
        <Link
          href={`/${entry.slug}`}
          className="hover:text-accent-gold transition-colors"
        >
          {entry.title}
        </Link>
      </h2>
      <p className="font-sans text-sm md:text-base leading-relaxed text-museum-light/75 line-clamp-4">
        {entry.excerpt}
      </p>
      <Link
        href={`/${entry.slug}`}
        className="inline-flex items-center gap-2 mt-4 min-h-11 py-2 font-sans text-xs tracking-widest uppercase text-museum-light/50 hover:text-accent-gold transition-colors touch-manipulation"
      >
        <span>Читать</span>
        <span aria-hidden="true">⟶</span>
      </Link>
    </article>
  );
}
