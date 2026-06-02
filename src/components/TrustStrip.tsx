import PaymentBadges from "@/components/PaymentBadges";

type TrustStripProps = {
  variant?: "dark" | "light";
  className?: string;
};

const trustPoints = [
  "Экспертиза и провенанс",
  "Белые перчатки при отгрузке",
  "Договор и страхование перевозки",
] as const;

export default function TrustStrip({
  variant = "light",
  className = "",
}: TrustStripProps) {
  const textClass =
    variant === "dark"
      ? "text-museum-light/70"
      : "text-luxury-charcoal/65";
  const borderClass =
    variant === "dark"
      ? "border-museum-light/10"
      : "border-luxury-charcoal/10";

  return (
    <div className={className}>
      <ul className={`flex flex-wrap gap-2 border-b ${borderClass} pb-4 mb-4`}>
        {trustPoints.map((point) => (
          <li
            key={point}
            className={`inline-flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-[0.12em] ${textClass}`}
          >
            <span className="text-accent-brass" aria-hidden="true">
              ✓
            </span>
            {point}
          </li>
        ))}
      </ul>
      <p
        className={`font-sans text-[10px] uppercase tracking-[0.14em] mb-2 ${textClass}`}
      >
        Принимаем к оплате
      </p>
      <PaymentBadges variant={variant} className="!mt-0 gap-2.5" />
    </div>
  );
}
