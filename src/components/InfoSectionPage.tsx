import Link from "next/link";
import ContentSectionCatalog from "@/components/ContentSectionCatalog";
import PageContainer from "@/components/PageContainer";
import PaymentBadges from "@/components/PaymentBadges";
import TradeApplyButton from "@/components/TradeApplyButton";
import { isContentListSection } from "@/lib/content";
import type { InfoSection } from "@/lib/info-sections";
import { siteConfig } from "@/lib/site";

type InfoSectionPageProps = {
  section: InfoSection;
};

function BlockContent({ blocks }: { blocks: NonNullable<InfoSection["blocks"]> }) {
  return (
    <div className="space-y-8 mb-8">
      {blocks.map((block) => (
        <div key={(block.heading ?? "") + block.paragraphs[0]?.slice(0, 24)}>
          {block.heading ? (
            <h2 className="font-serif text-xl md:text-2xl text-museum-light mb-3">
              {block.heading}
            </h2>
          ) : null}
          <div className="space-y-3 font-sans text-sm md:text-base leading-relaxed text-museum-light/75">
            {block.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ContactDetails({ contact }: { contact: NonNullable<InfoSection["contact"]> }) {
  const rows = [
    contact.address ? { label: "Адрес", value: contact.address } : null,
    contact.hours ? { label: "Часы работы", value: contact.hours } : null,
    contact.phone ? { label: "Телефон / WhatsApp", value: contact.phone } : null,
    contact.requisites ? { label: "Реквизиты", value: contact.requisites } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  if (!rows.length) return null;

  return (
    <dl className="space-y-4 mb-8 font-sans text-sm md:text-base">
      {rows.map((row) => (
        <div key={row.label}>
          <dt className="text-xs tracking-widest uppercase text-accent-gold/80 mb-1">
            {row.label}
          </dt>
          <dd className="text-museum-light/75 leading-relaxed">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

const CONTENT_ITEM_LABELS: Record<string, string> = {
  novosti: "новостей",
  stati: "статей",
  uslugi: "услуг",
};

export default function InfoSectionPage({ section }: InfoSectionPageProps) {
  const hasBlocks = section.blocks && section.blocks.length > 0;
  const useContentCatalog = isContentListSection(section.id);

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

        {section.description ? (
          <p className="font-sans text-sm md:text-base text-museum-light/60 mb-6 leading-relaxed">
            {section.description}
          </p>
        ) : null}

        {section.contact ? <ContactDetails contact={section.contact} /> : null}

        {useContentCatalog ? (
          <ContentSectionCatalog
            sectionId={section.id}
            itemLabel={CONTENT_ITEM_LABELS[section.id] ?? "материалов"}
          />
        ) : hasBlocks ? (
          <BlockContent blocks={section.blocks!} />
        ) : (
          <div className="space-y-4 font-sans text-sm md:text-base leading-relaxed text-museum-light/75 mb-8">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
        )}

        {section.id === "dostavka-i-oplata" ? (
          <PaymentBadges variant="dark" className="mb-8" />
        ) : null}

        {section.id === "sotrudnichestvo" ? (
          <div
            id="trade-program"
            className="mb-10 scroll-mt-[var(--site-header-offset)] rounded-sm border border-museum-light/12 bg-museum-light/[0.03] p-6 md:p-8"
          >
            <p className="font-sans text-xs tracking-widest uppercase text-accent-gold/85 mb-3">
              Trade‑программа
            </p>
            <p className="font-sans text-sm md:text-base text-museum-light/75 leading-relaxed mb-6 max-w-xl">
              Специальные условия для дизайнеров и архитекторов: персональный менеджер, ранний доступ к поступлениям и PDF‑листы для презентаций клиентам.
            </p>
            <TradeApplyButton variant="dark" />
          </div>
        ) : null}

        {section.catalogHref ? (
          <p className="mb-8">
            <Link
              href={section.catalogHref}
              className="inline-flex items-center gap-2 min-h-12 py-2 font-sans text-xs tracking-widest uppercase text-accent-gold hover:text-museum-light transition-colors"
            >
              <span>Открыть каталог</span>
              <span aria-hidden="true">⟶</span>
            </Link>
          </p>
        ) : null}

        <p className="font-sans text-sm text-museum-light/55">
          {siteConfig.name} · {siteConfig.addressLine}
        </p>
        {!section.catalogHref ? (
          <p className="mt-6">
            <Link
              href="/collection"
              className="inline-flex items-center gap-2 font-sans text-xs tracking-widest uppercase text-accent-gold hover:text-museum-light transition-colors"
            >
              <span>Смотреть коллекцию</span>
              <span aria-hidden="true">⟶</span>
            </Link>
          </p>
        ) : null}
      </PageContainer>
    </main>
  );
}
