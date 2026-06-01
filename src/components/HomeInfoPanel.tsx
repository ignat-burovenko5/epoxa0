import Link from "next/link";
import PaymentBadges from "@/components/PaymentBadges";
import type { InfoSection } from "@/lib/info-sections";

type HomeInfoPanelProps = {
  section: InfoSection;
};

export default function HomeInfoPanel({ section }: HomeInfoPanelProps) {
  return (
    <div className="max-w-2xl text-left">
      <div className="space-y-3 font-sans text-sm md:text-base leading-relaxed mb-6 text-museum-light/70">
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </div>
      {section.id === "dostavka-i-oplata" ? (
        <PaymentBadges variant="dark" />
      ) : null}
      <div className={section.id === "dostavka-i-oplata" ? "mt-6" : ""}>
        <Link
          href={section.href}
          className="inline-flex items-center gap-2 min-h-12 py-2 font-sans text-xs tracking-widest uppercase transition-colors touch-manipulation text-museum-light/50 hover:text-accent-gold"
        >
          <span>Подробнее</span>
          <span aria-hidden="true">⟶</span>
        </Link>
      </div>
    </div>
  );
}
