import Link from "next/link";

type Crumb = { label: string; href?: string };

type BlogBreadcrumbProps = {
  items: Crumb[];
  className?: string;
};

export default function BlogBreadcrumb({ items, className = "" }: BlogBreadcrumbProps) {
  return (
    <nav
      className={`mb-8 font-sans text-xs tracking-widest uppercase text-museum-light/50 ${className}`.trim()}
      aria-label="Навигация"
    >
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`}>
          {i > 0 ? (
            <span className="mx-2" aria-hidden="true">
              /
            </span>
          ) : null}
          {item.href ? (
            <Link href={item.href} className="hover:text-accent-gold transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-museum-light/80 line-clamp-1">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
