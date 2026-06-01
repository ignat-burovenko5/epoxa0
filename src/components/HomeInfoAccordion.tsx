"use client";

import { Children, useCallback, useId, useState, type ReactNode } from "react";
import PageContainer from "@/components/PageContainer";

type TabSection = {
  id: string;
  title: string;
  href: string;
  highlight?: boolean;
};

type HomeInfoAccordionProps = {
  sections: readonly TabSection[];
  children: ReactNode;
};

const tabButtonBase =
  "relative shrink-0 min-h-12 px-3 py-3 sm:px-4 md:py-3.5 font-sans text-[10px] sm:text-xs uppercase tracking-[0.12em] sm:tracking-widest whitespace-nowrap transition-colors duration-300 ease-luxury-ease focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent-gold/70 touch-manipulation cursor-pointer";

export default function HomeInfoAccordion({ sections, children }: HomeInfoAccordionProps) {
  const baseId = useId();
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const panels = Children.toArray(children);

  const activeIndex = sections.findIndex((s) => s.id === activeId);
  const isDark = activeIndex < 0 || activeIndex % 2 === 0;

  const onTabClick = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  return (
    <section
      className={`border-t transition-colors duration-300 ${
        isDark
          ? "bg-luxury-base text-museum-light border-museum-light/10"
          : "bg-museum-warm text-luxury-charcoal border-luxury-charcoal/10"
      }`}
    >
      <PageContainer className="pt-10 md:pt-12 pb-12 md:pb-16">
        <h2 className="sr-only">О галерее и услугах</h2>

        <div
          role="tablist"
          aria-label="Разделы салона"
          className="-mx-4 flex gap-0 overflow-x-auto hidden-scrollbar px-4 pb-px sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 border-b border-current/10"
        >
          {sections.map((section) => {
            const isActive = section.id === activeId;
            const isPromo = section.highlight;

            return (
              <button
                key={section.id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${section.id}`}
                aria-selected={isActive}
                aria-controls={`${baseId}-panel-${section.id}`}
                onClick={() => onTabClick(section.id)}
                className={`${tabButtonBase} ${
                  isActive
                    ? isPromo
                      ? "text-luxury-bordeaux"
                      : isDark
                        ? "text-accent-gold"
                        : "text-luxury-base"
                    : isDark
                      ? "text-museum-light/60 hover:text-museum-light/85"
                      : "text-luxury-charcoal/60 hover:text-luxury-charcoal/85"
                }`}
              >
                {section.title}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-2 sm:inset-x-3 bottom-0 h-px transition-opacity duration-300 ${
                    isActive
                      ? isPromo
                        ? "bg-luxury-bordeaux opacity-100"
                        : "bg-accent-gold opacity-100"
                      : "opacity-0"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {sections.map((section, index) => {
          const isActive = section.id === activeId;

          return (
            <div
              key={section.id}
              role="tabpanel"
              id={`${baseId}-panel-${section.id}`}
              aria-labelledby={`${baseId}-tab-${section.id}`}
              hidden={!isActive}
              className={isActive ? "block pt-8 md:pt-10" : "hidden"}
            >
              {panels[index]}
            </div>
          );
        })}
      </PageContainer>
    </section>
  );
}
