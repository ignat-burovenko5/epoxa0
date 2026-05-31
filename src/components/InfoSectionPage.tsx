import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import PaymentBadges from "@/components/PaymentBadges";
import type { homeSections } from "@/lib/site";
import { siteConfig } from "@/lib/site";

type HomeSection = (typeof homeSections)[number];

type InfoSectionPageProps = {
  section: HomeSection;
};

export default function InfoSectionPage({ section }: InfoSectionPageProps) {
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
          <span className="text-museum-light/80">{section.title}</span>
        </nav>
        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-6 leading-tight">
          {section.title}
        </h1>
        <div className="space-y-4 font-sans text-sm md:text-base leading-relaxed text-museum-light/75 mb-8">
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
        {section.id === "dostavka-i-oplata" ? (
          <PaymentBadges variant="dark" className="mb-8" />
        ) : null}
        <p className="font-sans text-sm text-museum-light/55">
          {siteConfig.name} · {siteConfig.addressLine}
        </p>
        <p className="mt-6">
          <Link
            href="/collection"
            className="inline-flex items-center gap-2 font-sans text-xs tracking-widest uppercase text-accent-gold hover:text-museum-light transition-colors"
          >
            <span>Смотреть коллекцию</span>
            <span aria-hidden="true">⟶</span>
          </Link>
        </p>
      </PageContainer>
    </main>
  );
}
