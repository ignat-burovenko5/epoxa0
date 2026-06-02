import Link from "next/link";
import { ArrowSquareUpRightIcon } from "@/components/NavContactIcons";
import type { ReactNode } from "react";
import type { InfoBlock } from "@/lib/info-sections";
import { headingAnchorId, INFO_PHONE_PATTERN, splitBulletItems } from "@/lib/info-text";
import { siteConfig } from "@/lib/site";

type InfoBlocksProps = {
  blocks: readonly InfoBlock[];
  variant?: "full" | "compact";
  sectionHref?: string;
  linkifyPhones?: boolean;
};

function TextWithPhoneLinks({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(INFO_PHONE_PATTERN.source, "g");

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <a
        key={match.index}
        href={siteConfig.phoneHref}
        className="text-accent-gold hover:text-museum-light underline underline-offset-2"
      >
        {match[0]}
      </a>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts.length ? parts : text}</>;
}

export default function InfoBlocks({
  blocks,
  variant = "full",
  sectionHref,
  linkifyPhones = false,
}: InfoBlocksProps) {
  if (variant === "compact" && sectionHref) {
    return (
      <ul className="space-y-2.5 mb-6 font-sans text-sm md:text-base">
        {blocks.map((block) => {
          const heading = block.heading ?? "";
          const anchor = heading ? headingAnchorId(heading) : "";
          return (
            <li key={heading + block.paragraphs[0]?.slice(0, 24)}>
              <Link
                href={anchor ? `${sectionHref}#${anchor}` : sectionHref}
                className="inline-flex min-h-11 items-center gap-2 py-1 text-museum-light/75 hover:text-accent-gold transition-colors touch-manipulation"
              >
                <span>{heading.replace(/\.$/, "")}</span>
                <ArrowSquareUpRightIcon className="h-4 w-4 shrink-0" />
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="space-y-8 mb-8">
      {blocks.map((block) => {
        const heading = block.heading ?? "";
        const anchor = heading ? headingAnchorId(heading) : undefined;

        return (
          <section
            key={heading + block.paragraphs[0]?.slice(0, 24)}
            id={anchor}
            className="scroll-mt-[calc(var(--site-header-offset)+1rem)]"
          >
            {heading ? (
              <h2 className="font-serif text-xl md:text-2xl text-museum-light mb-3">
                {heading}
              </h2>
            ) : null}
            {block.paragraphs.map((paragraph) => {
              const items = splitBulletItems(paragraph);

              if (items.length > 1) {
                return (
                  <ul
                    key={paragraph.slice(0, 32)}
                    className="list-disc space-y-2 pl-5 font-sans text-sm md:text-base leading-relaxed text-museum-light/75 marker:text-accent-gold/70"
                  >
                    {items.map((item) => (
                      <li key={item.slice(0, 40)}>
                        {linkifyPhones ? (
                          <TextWithPhoneLinks text={item} />
                        ) : (
                          item
                        )}
                      </li>
                    ))}
                  </ul>
                );
              }

              return (
                <p
                  key={paragraph.slice(0, 32)}
                  className="font-sans text-sm md:text-base leading-relaxed text-museum-light/75"
                >
                  {linkifyPhones ? (
                    <TextWithPhoneLinks text={items[0] ?? paragraph} />
                  ) : (
                    items[0] ?? paragraph
                  )}
                </p>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
