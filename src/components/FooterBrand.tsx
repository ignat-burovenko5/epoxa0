import BrandLines from "@/components/BrandLines";
import Logo from "@/components/Logo";

export default function FooterBrand() {
  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <Logo size="footerCompact" />
      <div>
        <BrandLines variant="compact" className="mb-2" />
        <p className="font-serif text-base md:text-lg leading-snug text-museum-light/80">
          Музейные предметы с подтверждённым провенансом
        </p>
      </div>
    </div>
  );
}
