import Link from "next/link";
import { salonContactFields } from "@/lib/salon-contact";

type SalonContactDetailsProps = {
  className?: string;
  title?: string;
};

export default function SalonContactDetails({
  className = "",
  title = "Контакты салона",
}: SalonContactDetailsProps) {
  return (
    <div className={className}>
      {title ? (
        <p className="mb-4 font-sans text-[10px] uppercase tracking-[0.25em] text-accent-gold/90">
          {title}
        </p>
      ) : null}
      <dl className="space-y-4 font-sans text-sm md:text-base">
        {salonContactFields.map((field) => (
          <div key={field.label}>
            <dt className="text-[10px] uppercase tracking-[0.2em] text-museum-light/60 mb-1">
              {field.label}
            </dt>
            <dd className="text-museum-light/85 leading-relaxed">
              {field.href ? (
                <Link
                  href={field.href}
                  className="font-serif text-base md:text-lg text-museum-light/90 hover:text-accent-gold transition-colors"
                  {...(field.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {field.value}
                </Link>
              ) : (
                <span className="font-serif text-base md:text-lg text-museum-light/80">
                  {field.value}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
