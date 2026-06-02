import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import type { LegalDocument } from "@/lib/legal";

type LegalDocumentPageProps = {
  document: LegalDocument;
};

export default function LegalDocumentPage({ document }: LegalDocumentPageProps) {
  return (
    <main className="bg-luxury-base text-museum-light min-h-[50vh]">
      <PageContainer className="py-10 md:py-14 max-w-3xl">
        <nav className="mb-8 font-sans text-xs tracking-widest uppercase text-museum-light/50">
          <Link
            href="/"
            className="hover:text-accent-gold transition-colors min-h-11 inline-flex items-center"
          >
            Главная
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-museum-light/80">{document.shortTitle}</span>
        </nav>

        <h1 className="font-serif text-3xl md:text-4xl mb-6 leading-tight">
          {document.title}
        </h1>

        <div className="space-y-4 font-sans text-sm md:text-base leading-relaxed text-museum-light/75 mb-10">
          {document.intro.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>

        <div className="space-y-8">
          {document.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-serif text-xl md:text-2xl text-museum-light mb-3">
                {section.heading}
              </h2>
              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="font-sans text-sm md:text-base leading-relaxed text-museum-light/75 mb-3 last:mb-0"
                >
                  {paragraph}
                </p>
              ))}
              {section.list ? (
                <ul className="list-disc space-y-2 pl-5 font-sans text-sm md:text-base leading-relaxed text-museum-light/75 marker:text-accent-gold/70">
                  {section.list.map((item) => (
                    <li key={item.slice(0, 40)}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {section.orderedList ? (
                <ol className="list-decimal space-y-2 pl-5 font-sans text-sm md:text-base leading-relaxed text-museum-light/75 marker:text-accent-gold/80">
                  {section.orderedList.map((item) => (
                    <li key={item.slice(0, 40)}>{item}</li>
                  ))}
                </ol>
              ) : null}
            </section>
          ))}
        </div>
      </PageContainer>
    </main>
  );
}
