import HomeInfoPanel from "@/components/HomeInfoPanel";
import PageContainer from "@/components/PageContainer";
import { homeSections } from "@/lib/info-sections";

const tabLabelClass =
  "relative shrink-0 min-h-12 px-3 py-3 sm:px-4 md:py-3.5 font-sans text-[10px] sm:text-xs uppercase tracking-[0.12em] sm:tracking-widest whitespace-nowrap transition-colors duration-300 ease-luxury-ease text-museum-light/60 hover:text-museum-light/85 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent-gold/70 touch-manipulation cursor-pointer";

const tabPanelCss = homeSections
  .map(
    (s) =>
      `.home-info-tabs:has(#home-info-${s.id}:checked) [data-panel="${s.id}"]{display:block}`,
  )
  .join("\n");

const tabActiveCss = homeSections
  .map(
    (s) =>
      `.home-info-tabs:has(#home-info-${s.id}:checked) label[for="home-info-${s.id}"]{color:var(--color-accent-gold)}.home-info-tabs:has(#home-info-${s.id}:checked) label[for="home-info-${s.id}"] .tab-indicator{opacity:1}`,
  )
  .join("\n");

export default function HomeInfoSections() {
  return (
    <section className="home-info-tabs border-t bg-luxury-base text-museum-light border-museum-light/10">
      <style
        dangerouslySetInnerHTML={{
          __html: `.home-info-tabs [data-panel]{display:none;padding-top:2rem}@media(min-width:768px){.home-info-tabs [data-panel]{padding-top:2.5rem}}${tabPanelCss}${tabActiveCss}`,
        }}
      />
      <PageContainer className="pt-10 md:pt-12 pb-12 md:pb-16">
        <h2 className="sr-only">О галерее и услугах</h2>

        {homeSections.map((section, index) => (
          <input
            key={section.id}
            type="radio"
            name="home-info"
            id={`home-info-${section.id}`}
            defaultChecked={index === 0}
            className="sr-only"
          />
        ))}

        <div
          role="tablist"
          aria-label="Разделы салона"
          className="relative z-10 -mx-4 flex gap-0 overflow-x-auto hidden-scrollbar px-4 pb-px sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 border-b border-current/10"
        >
          {homeSections.map((section) => (
            <label
              key={section.id}
              id={`home-info-tab-${section.id}`}
              htmlFor={`home-info-${section.id}`}
              role="tab"
              className={tabLabelClass}
            >
              {section.title}
              <span
                aria-hidden="true"
                className="tab-indicator absolute inset-x-2 sm:inset-x-3 bottom-0 h-px bg-accent-gold opacity-0 transition-opacity duration-300"
              />
            </label>
          ))}
        </div>

        {homeSections.map((section) => (
          <div
            key={section.id}
            role="tabpanel"
            data-panel={section.id}
            aria-labelledby={`home-info-tab-${section.id}`}
          >
            <HomeInfoPanel section={section} />
          </div>
        ))}
      </PageContainer>
    </section>
  );
}
