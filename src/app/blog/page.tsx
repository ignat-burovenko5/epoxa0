import type { Metadata } from "next";
import Link from "next/link";
import BlogBreadcrumb from "@/components/blog/BlogBreadcrumb";
import BlogInfiniteList from "@/components/blog/BlogInfiniteList";
import PageContainer from "@/components/PageContainer";
import { blogIndexMetadata } from "@/lib/blog/metadata";
import { getBlogListPage } from "@/lib/blog/posts";
import { getBlogStore } from "@/lib/blog/store";

export async function generateMetadata(): Promise<Metadata> {
  const store = await getBlogStore();
  return blogIndexMetadata(store.settings);
}

export default async function BlogIndexPage() {
  const store = await getBlogStore();
  const { settings } = store;

  if (!settings.enabled) {
    return (
      <main className="bg-luxury-base text-museum-light min-h-[50vh]">
        <PageContainer className="py-10 md:py-14 max-w-3xl text-center">
          <p className="font-sans text-sm text-museum-light/60">
            Раздел временно недоступен.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 font-sans text-xs tracking-widest uppercase text-accent-gold"
          >
            На главную
          </Link>
        </PageContainer>
      </main>
    );
  }

  const page = await getBlogListPage(0, settings.pageSize);

  return (
    <main className="bg-luxury-base text-museum-light min-h-[50vh]">
      <PageContainer className="py-10 md:py-14 max-w-3xl">
        <BlogBreadcrumb
          items={[{ label: "Главная", href: "/" }, { label: settings.index.title }]}
        />
        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-4 leading-tight">
          {settings.index.title}
        </h1>
        <p className="font-sans text-sm md:text-base text-museum-light/60 mb-10 leading-relaxed">
          {settings.index.description}
        </p>

        <BlogInfiniteList
          initialItems={page.items}
          initialTotal={page.total}
          initialHasMore={page.hasMore}
          pageSize={settings.pageSize}
          itemLabel={settings.index.itemLabel}
          emptyMessage={settings.index.emptyMessage}
        />
      </PageContainer>
    </main>
  );
}
