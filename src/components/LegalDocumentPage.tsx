import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import { siteConfig } from "@/lib/site";
import type { legalDocuments } from "@/lib/legal";

type LegalDoc = (typeof legalDocuments)[number];

type LegalDocumentPageProps = {
  document: LegalDoc;
};

export default function LegalDocumentPage({ document }: LegalDocumentPageProps) {
  return (
    <main className="bg-luxury-base text-museum-light min-h-[50vh]">
      <PageContainer className="py-10 md:py-14 max-w-3xl">
        <nav className="mb-8 font-sans text-xs tracking-widest uppercase text-museum-light/50">
          <Link href="/" className="hover:text-accent-gold transition-colors min-h-11 inline-flex items-center">
            Главная
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-museum-light/80">{document.shortTitle}</span>
        </nav>
        <h1 className="font-serif text-3xl md:text-4xl mb-6 leading-tight">{document.title}</h1>
        <div className="space-y-4 font-sans text-sm md:text-base leading-relaxed text-museum-light/75">
          {document.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
        <p className="mt-10 font-sans text-sm text-museum-light/55">
          {siteConfig.name} · {siteConfig.addressLine}
        </p>
      </PageContainer>
    </main>
  );
}
