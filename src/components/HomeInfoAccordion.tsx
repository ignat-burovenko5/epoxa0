import { Children, type ReactNode } from "react";
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

export default function HomeInfoAccordion({ sections, children }: HomeInfoAccordionProps) {
  const panels = Children.toArray(children);

  return (
    <section className="border-t bg-luxury-base text-museum-light border-museum-light/10">
      <PageContainer className="pt-10 md:pt-12 pb-12 md:pb-16">
        <h2 className="sr-only">О галерее и услугах</h2>
        <div className="salon-accordion divide-y divide-museum-light/10 border-y border-museum-light/10">
          {sections.map((section, index) => {
            const isDark = index % 2 === 0;
            const panel = panels[index];

            return (
              <details
                key={section.id}
                name="salon-sections"
                id={section.id}
                open={index === 0}
                className={`salon-accordion__item group ${isDark ? "salon-accordion__item--dark" : "salon-accordion__item--light"}`}
              >
                <summary className="salon-accordion__summary">
                  <span className="salon-accordion__title">{section.title}</span>
                  <span className="salon-accordion__chevron" aria-hidden="true" />
                </summary>
                <div className="salon-accordion__panel">{panel}</div>
              </details>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}
