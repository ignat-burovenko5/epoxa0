import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import type { ContentEntry } from "@/lib/content";
import { siteConfig } from "@/lib/site";

type ContentEntryPageProps = {
  entry: ContentEntry;
};

export default function ContentEntryPage({ entry }: ContentEntryPageProps) {
  const text = entry.body ?? entry.excerpt;

  return (
    <main className="bg-luxury-base text-museum-light min-h-[50vh]">
      <PageContainer className="py-10 md:py-14 max-w-3xl">
        <nav className="mb-8 font-sans text-xs tracking-widest uppercase text-museum-light/50">
          <Link href="/" className="hover:text-accent-gold transition-colors">
            Главная
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <Link
            href={entry.sectionHref}
            className="hover:text-accent-gold transition-colors"
          >
            {entry.sectionTitle}
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-museum-light/80 line-clamp-1">{entry.title}</span>
        </nav>

        {entry.date ? (
          <time
            dateTime={entry.date.split(".").reverse().join("-")}
            className="font-sans text-xs tracking-widest uppercase text-accent-gold/80 mb-3 block"
          >
            {entry.date}
          </time>
        ) : null}

        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-8 leading-tight">
          {entry.title}
        </h1>

        <div className="space-y-4 font-sans text-sm md:text-base leading-relaxed text-museum-light/75 mb-10 whitespace-pre-line">
          {text.split(/\n\n+/).map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>

        <p className="mb-8">
          <Link
            href={entry.sectionHref}
            className="inline-flex items-center gap-2 font-sans text-xs tracking-widest uppercase text-accent-gold hover:text-museum-light transition-colors"
          >
            <span>← Все {entry.sectionTitle.toLowerCase()}</span>
          </Link>
        </p>

        <p className="font-sans text-sm text-museum-light/55">
          {siteConfig.name} · {siteConfig.addressLine}
        </p>
      </PageContainer>
    </main>
  );
}
