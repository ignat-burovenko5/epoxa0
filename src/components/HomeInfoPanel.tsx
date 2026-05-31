import Link from "next/link";
import PaymentBadges from "@/components/PaymentBadges";
import { homeSections } from "@/lib/site";

type HomeSection = (typeof homeSections)[number];

type HomeInfoPanelProps = {
  section: HomeSection;
  index: number;
};

export default function HomeInfoPanel({ section, index }: HomeInfoPanelProps) {
  const panelDark = index % 2 === 0;

  return (
    <div className="max-w-2xl text-left">
      <div
        className={`space-y-3 font-sans text-sm md:text-base leading-relaxed mb-6 ${
          panelDark ? "text-museum-light/70" : "text-luxury-charcoal/80"
        }`}
      >
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </div>
      {section.id === "dostavka-i-oplata" ? (
        <PaymentBadges variant={panelDark ? "dark" : "light"} />
      ) : null}
      <div className={section.id === "dostavka-i-oplata" ? "mt-6" : ""}>
        <Link
          href={section.href}
          className={`inline-flex items-center gap-2 min-h-12 py-2 font-sans text-xs tracking-widest uppercase transition-colors touch-manipulation ${
            panelDark
              ? "text-museum-light/50 hover:text-accent-gold"
              : "text-luxury-charcoal/50 hover:text-accent-brass"
          }`}
        >
          <span>Подробнее</span>
          <span aria-hidden="true">⟶</span>
        </Link>
      </div>
    </div>
  );
}
