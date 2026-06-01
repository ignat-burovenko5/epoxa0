import PageContainer from "@/components/PageContainer";
import TradeApplyButton from "@/components/TradeApplyButton";

export default function TradeProgramSection() {
  return (
    <section
      id="trade-program"
      className="section-y bg-museum-light text-luxury-charcoal border-t border-museum-light/10 scroll-mt-[var(--site-header-offset)]"
    >
      <PageContainer>
        <div className="max-w-2xl">
          <p className="font-sans text-xs tracking-widest uppercase text-accent-gold-on-light mb-3">
            Для дизайнеров и архитекторов
          </p>
          <h2 className="font-serif text-3xl md:text-4xl mb-4 text-luxury-base">
            Trade‑программа для профессионалов
          </h2>
          <p className="font-sans text-sm md:text-base text-luxury-charcoal/80 leading-relaxed mb-6">
            Специальные условия, персональный менеджер, ранний доступ к новым поступлениям и PDF‑листы для презентаций клиентам.
          </p>
          <div className="pb-2">
            <TradeApplyButton variant="light" />
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
