import Link from "next/link";
import BrandLines from "@/components/BrandLines";

export default function FooterBrand() {
  return (
    <Link
      href="/"
      className="logo-nav-link inline-block w-fit max-w-full hover:opacity-90 transition-opacity focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent-gold/70"
      aria-label="На главную"
    >
      <BrandLines variant="hero" />
    </Link>
  );
}
