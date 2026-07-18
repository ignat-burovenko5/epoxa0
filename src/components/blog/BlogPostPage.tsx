import Image from "next/image";
import Link from "next/link";
import BlogBreadcrumb from "@/components/blog/BlogBreadcrumb";
import BlogPostBody from "@/components/blog/BlogPostBody";
import PageContainer from "@/components/PageContainer";
import { dateTimeToIsoDate } from "@/lib/blog/format";
import { mergePostDisplay } from "@/lib/blog/posts";
import { resolveBlogPostSeo } from "@/lib/blog/seo";
import type { BlogPost, BlogSettings } from "@/lib/blog/types";
import { blogIndexPath } from "@/lib/blog/urls";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";

const WIDTH_CLASS = {
  narrow: "max-w-2xl",
  default: "max-w-3xl",
  wide: "max-w-4xl",
} as const;

type BlogPostPageProps = {
  post: BlogPost;
  settings: BlogSettings;
};

export default function BlogPostPage({ post, settings }: BlogPostPageProps) {
  const display = mergePostDisplay(post, settings.defaultDisplay);
  const isLight = display.theme === "light";
  const widthClass = WIDTH_CLASS[display.maxWidth];
  const iso = dateTimeToIsoDate(post.date);
  const showCover = display.showCover && post.coverImage?.src;
  const seo = resolveBlogPostSeo(post);
  const structuredData = [
    articleJsonLd({
      title: post.title,
      description: post.excerpt,
      path: seo.canonicalPath,
      image: seo.ogImage,
      datePublished: post.publishedAt ?? iso,
      dateModified: post.updatedAt ?? post.publishedAt ?? iso,
      author: post.author,
    }),
    breadcrumbJsonLd([
      { name: "Главная", path: "/" },
      { name: settings.index.title, path: blogIndexPath() },
      { name: post.title, path: seo.canonicalPath },
    ]),
  ];

  const mainClass = isLight
    ? "bg-museum-light text-luxury-charcoal min-h-[50vh] -mt-[var(--site-header-offset)] pt-[var(--site-header-offset)]"
    : "bg-luxury-base text-museum-light min-h-[50vh]";

  const mutedClass = isLight ? "text-luxury-charcoal/55" : "text-museum-light/50";
  const bodyMuted = isLight ? "text-luxury-charcoal/75" : "";

  return (
    <main className={`${mainClass} ${display.className}`.trim()}>
      <PageContainer className={`py-10 md:py-14 ${widthClass}`}>
        <BlogBreadcrumb
          className={mutedClass}
          items={[
            { label: "Главная", href: "/" },
            { label: settings.index.title, href: blogIndexPath() },
            { label: post.title },
          ]}
        />

        {display.showDate && post.date ? (
          <time
            dateTime={iso}
            className="font-sans text-xs tracking-widest uppercase text-accent-gold/80 mb-3 block"
          >
            {post.date}
          </time>
        ) : null}

        <h1
          className={`font-serif text-3xl md:text-4xl lg:text-5xl mb-4 leading-tight ${
            isLight ? "text-luxury-base" : ""
          }`}
        >
          {post.title}
        </h1>

        {display.showAuthor && post.author ? (
          <p className={`font-sans text-xs tracking-widest uppercase mb-6 ${mutedClass}`}>
            {post.author}
          </p>
        ) : null}

        {display.showTags && post.tags && post.tags.length > 0 ? (
          <ul className="flex flex-wrap gap-2 mb-8 list-none p-0 m-0">
            {post.tags.map((tag) => (
              <li
                key={tag}
                className={`font-sans text-[10px] tracking-widest uppercase border px-2 py-0.5 ${
                  isLight
                    ? "border-luxury-charcoal/20 text-luxury-charcoal/60"
                    : "border-museum-light/15 text-museum-light/40"
                }`}
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        {showCover ? (
          <div className="relative aspect-[16/9] mb-10 overflow-hidden bg-luxury-charcoal">
            <Image
              src={post.coverImage!.src}
              alt={post.coverImage!.alt}
              fill
              className="object-cover"
              style={
                post.coverImage!.position
                  ? { objectPosition: post.coverImage!.position }
                  : undefined
              }
              sizes="(max-width: 1024px) 100vw, 896px"
              priority
            />
          </div>
        ) : null}

        <BlogPostBody
          body={post.body}
          bodyFormat={post.bodyFormat}
          className={bodyMuted}
        />

        <p className="mb-8">
          <Link
            href={blogIndexPath()}
            className="inline-flex items-center gap-2 font-sans text-xs tracking-widest uppercase text-accent-gold hover:text-museum-light transition-colors"
          >
            <span>← Все записи</span>
          </Link>
        </p>
      </PageContainer>
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(structuredData)}
      </script>
    </main>
  );
}
