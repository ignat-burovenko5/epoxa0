import Image from "next/image";
import Link from "next/link";
import { ArrowSquareUpRightIcon } from "@/components/NavContactIcons";
import type { BlogPostSummary } from "@/lib/blog/types";
import { dateTimeToIsoDate } from "@/lib/blog/format";
import { blogPostPublicPath } from "@/lib/blog/urls";

type BlogPostCardProps = {
  post: BlogPostSummary;
};

export default function BlogPostCard({ post }: BlogPostCardProps) {
  const iso = dateTimeToIsoDate(post.date);
  const href = blogPostPublicPath(post);

  return (
    <Link
      href={href}
      className={`blog-post-card group block touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-gold/70 ${
        post.featured ? "blog-post-card--featured" : ""
      }`}
    >
      <article className="relative overflow-hidden border border-museum-light/12 bg-luxury-charcoal/35 p-5 md:p-7 transition-[border-color,background-color,box-shadow] duration-300 ease-luxury-ease group-hover:border-accent-gold/45 group-hover:bg-luxury-charcoal/55 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
        {post.featured ? (
          <span className="absolute top-0 right-0 font-sans text-[10px] tracking-widest uppercase text-luxury-base bg-accent-gold/90 px-3 py-1">
            Избранное
          </span>
        ) : null}

        {post.coverImage?.src ? (
          <div className="relative aspect-[16/9] -mx-5 -mt-5 mb-5 md:-mx-7 md:-mt-7 md:mb-6 overflow-hidden bg-luxury-base">
            <Image
              src={post.coverImage.src}
              alt={post.coverImage.alt}
              fill
              className="object-cover transition-transform duration-500 ease-luxury-ease group-hover:scale-[1.03]"
              style={
                post.coverImage.position
                  ? { objectPosition: post.coverImage.position }
                  : undefined
              }
              sizes="(max-width: 768px) 100vw, 720px"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-luxury-base/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"
              aria-hidden="true"
            />
          </div>
        ) : null}

        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-3">
          {post.date ? (
            <time
              dateTime={iso}
              className="font-sans text-xs tracking-widest uppercase text-accent-gold/80"
            >
              {post.date}
            </time>
          ) : (
            <span />
          )}
          <span
            className="font-sans text-[10px] tracking-widest uppercase text-museum-light/35 group-hover:text-accent-gold/70 transition-colors"
            aria-hidden="true"
          >
            Статья
          </span>
        </div>

        <h2 className="font-serif text-xl md:text-2xl lg:text-[1.65rem] text-museum-light mb-3 leading-tight transition-colors group-hover:text-accent-gold">
          {post.title}
        </h2>

        <p className="font-sans text-sm md:text-base leading-relaxed text-museum-light/70 line-clamp-3 md:line-clamp-4">
          {post.excerpt}
        </p>

        {post.tags && post.tags.length > 0 ? (
          <ul className="flex flex-wrap gap-2 mt-4 list-none p-0 m-0">
            {post.tags.slice(0, 4).map((tag) => (
              <li
                key={tag}
                className="font-sans text-[10px] tracking-widest uppercase text-museum-light/45 border border-museum-light/15 px-2 py-0.5 group-hover:border-museum-light/25 transition-colors"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        <p className="mt-5 pt-4 border-t border-museum-light/10 flex items-center justify-between gap-4 font-sans text-xs tracking-widest uppercase text-museum-light/50 group-hover:text-accent-gold transition-colors">
          <span>Читать</span>
          <ArrowSquareUpRightIcon className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
        </p>
      </article>
    </Link>
  );
}
