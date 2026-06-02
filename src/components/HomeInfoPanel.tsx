import Link from "next/link";
import { ArrowSquareUpRightIcon } from "@/components/NavContactIcons";
import InfoBlocks from "@/components/InfoBlocks";
import YandexSalonMap from "@/components/YandexSalonMap";
import { getSectionEntries, isContentListSection } from "@/lib/content";
import type { InfoSection } from "@/lib/info-sections";

const HOME_CONTENT_PREVIEW = 4;

const sectionCtaLabel: Partial<Record<InfoSection["id"], string>> = {
  "o-salone": "Узнать больше о салоне",
  novosti: "Все новости",
  skidki: "Условия акций",
  uslugi: "Подробнее об услугах",
  sotrudnichestvo: "Условия для партнёров",
  stati: "Читать статьи",
  adres: "Адрес и карта",
};

type HomeInfoPanelProps = {
  section: InfoSection;
};

export default function HomeInfoPanel({ section }: HomeInfoPanelProps) {
  const contentPreview = isContentListSection(section.id)
    ? getSectionEntries(section.id).slice(0, HOME_CONTENT_PREVIEW)
    : [];
  const hasBlocks = section.blocks && section.blocks.length > 0;
  const hasNamedBlocks = hasBlocks
    ? section.blocks!.some((block) => Boolean(block.heading))
    : false;

  return (
    <div className="max-w-2xl text-left">
      {hasNamedBlocks ? (
        <InfoBlocks
          blocks={section.blocks!}
          variant="compact"
          sectionHref={section.href}
        />
      ) : contentPreview.length > 0 ? (
        <ul className="space-y-6 mb-6">
          {contentPreview.map((entry) => (
            <li
              key={entry.slug}
              className="border-b border-museum-light/10 pb-6 last:border-0 last:pb-0"
            >
              {entry.date ? (
                <time
                  dateTime={entry.date.split(/[./]/).reverse().join("-")}
                  className="font-sans text-xs tracking-widest uppercase text-accent-gold/80 mb-1.5 block"
                >
                  {entry.date}
                </time>
              ) : null}
              <h3 className="font-serif text-lg md:text-xl text-museum-light mb-2">
                <Link
                  href={`/${entry.slug}`}
                  className="hover:text-accent-gold transition-colors"
                >
                  {entry.title}
                </Link>
              </h3>
              <p className="font-sans text-sm leading-relaxed text-museum-light/70 line-clamp-2">
                {entry.excerpt}
              </p>
              <Link
                href={`/${entry.slug}`}
                className="inline-flex items-center gap-2 mt-3 min-h-11 py-1 font-sans text-xs tracking-widest uppercase text-museum-light/50 hover:text-accent-gold transition-colors touch-manipulation"
              >
                <span>Читать</span>
                <ArrowSquareUpRightIcon className="h-4 w-4 shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="space-y-3 font-sans text-sm md:text-base leading-relaxed mb-6 text-museum-light/70">
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
      )}
      {section.id === "adres" ? (
        <YandexSalonMap compact heading="Как добраться" className="mb-6" />
      ) : null}
      <div>
        <Link
          href={section.href}
          className="inline-flex items-center gap-2 min-h-12 py-2 font-sans text-xs tracking-widest uppercase transition-colors touch-manipulation text-museum-light/50 hover:text-accent-gold"
        >
          <span>{sectionCtaLabel[section.id] ?? "Подробнее"}</span>
          <ArrowSquareUpRightIcon className="h-4 w-4 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
