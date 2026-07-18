"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardAnalyticsPanel from "@/components/blog/cms/DashboardAnalyticsPanel";
import DashboardBlogPanel from "@/components/blog/cms/DashboardBlogPanel";
import DashboardProductsPanel from "@/components/blog/cms/DashboardProductsPanel";
import { useLiveDashboardOverview } from "@/hooks/useLiveDashboardOverview";
import type { DashboardOverview } from "@/lib/dashboard/overview";
import type { BlogPostSummary } from "@/lib/blog/types";
import type { ProductListPage } from "@/lib/shop/product-types";
import { parseOverviewPeriodDays } from "@/lib/dashboard/period";
import {
  blogAdminAnalyticsPath,
  blogAdminBlogPath,
  blogAdminProductsPath,
} from "@/lib/blog/urls";

type CmsHubProps = {
  overview: DashboardOverview;
  posts: BlogPostSummary[];
  productsPage: ProductListPage;
};

const hubBtnClass =
  "group flex flex-col items-start justify-between min-h-[9rem] p-6 md:p-8 border border-museum-light/15 bg-luxury-base/30 hover:border-accent-gold/45 hover:bg-luxury-base/50 transition-colors text-left w-full";

export default function CmsHub({
  overview: initialOverview,
  posts,
  productsPage,
}: CmsHubProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get("view");
  const productStatus = searchParams.get("status") ?? "all";
  const periodDays = parseOverviewPeriodDays(searchParams.get("days"));
  const focusDate = searchParams.get("date") ?? undefined;
  const liveStats = view === null || view === "analytics";
  const { overview } = useLiveDashboardOverview(initialOverview, {
    enabled: liveStats,
    periodDays,
    focusDate,
  });

  if (view === "blog") {
    return (
      <div className="space-y-8">
        <HubToolbar active="blog" />
        <DashboardBlogPanel blog={overview.blog} posts={posts} />
      </div>
    );
  }

  if (view === "analytics") {
    return (
      <div className="space-y-8">
        <HubToolbar active="analytics" live />
        <DashboardAnalyticsPanel analytics={overview.analytics} />
      </div>
    );
  }

  if (view === "products") {
    return (
      <div className="space-y-8">
        <HubToolbar active="products" />
        <DashboardProductsPanel
          initialPage={productsPage}
          initialStatus={productStatus}
        />
      </div>
    );
  }

  return (
    <div className="py-6 md:py-10">
      <p className="font-sans text-sm text-museum-light/50 text-center mb-8 max-w-md mx-auto">
        Выберите раздел панели управления
      </p>
      <div className="grid sm:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
        <button
          type="button"
          onClick={() => router.push(blogAdminProductsPath())}
          className={hubBtnClass}
        >
          <span className="font-sans text-[10px] tracking-widest uppercase text-accent-gold/80 mb-3">
            Каталог
          </span>
          <span className="font-serif text-2xl md:text-3xl text-museum-light mb-2">
            Товары
          </span>
          <span className="font-sans text-sm text-museum-light/50 leading-relaxed">
            {productsPage.counts.active} на сайте · {productsPage.counts.archived}{" "}
            в архиве · {productsPage.counts.all} всего
          </span>
        </button>
        <button type="button" onClick={() => router.push(blogAdminBlogPath())} className={hubBtnClass}>
          <span className="font-sans text-[10px] tracking-widest uppercase text-accent-gold/80 mb-3">
            Контент
          </span>
          <span className="font-serif text-2xl md:text-3xl text-museum-light mb-2">Блог</span>
          <span className="font-sans text-sm text-museum-light/50 leading-relaxed">
            {overview.blog.published} опубликовано · {overview.blog.drafts} черновиков ·{" "}
            {posts.length} записей
          </span>
        </button>
        <button
          type="button"
          onClick={() => router.push(blogAdminAnalyticsPath())}
          className={hubBtnClass}
        >
          <span className="font-sans text-[10px] tracking-widest uppercase text-accent-gold/80 mb-3">
            Статистика
          </span>
          <span className="font-serif text-2xl md:text-3xl text-museum-light mb-2">Аналитика</span>
          <span className="font-sans text-sm text-museum-light/50 leading-relaxed">
            {overview.analytics.viewsTotals.day} сегодня ·{" "}
            {overview.analytics.viewsTotals.week} за неделю
          </span>
        </button>
      </div>
    </div>
  );
}

function HubToolbar({
  active,
  live,
}: {
  active: "blog" | "analytics" | "products";
  live?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-museum-light/10 font-sans text-xs tracking-widest uppercase">
      <Link
        href={blogAdminProductsPath()}
        className={
          active === "products"
            ? "text-accent-gold"
            : "text-museum-light/50 hover:text-accent-gold"
        }
        aria-current={active === "products" ? "page" : undefined}
      >
        Товары
      </Link>
      <span className="text-museum-light/20">/</span>
      <Link
        href={blogAdminBlogPath()}
        className={
          active === "blog"
            ? "text-accent-gold"
            : "text-museum-light/50 hover:text-accent-gold"
        }
        aria-current={active === "blog" ? "page" : undefined}
      >
        Блог
      </Link>
      <span className="text-museum-light/20">/</span>
      <Link
        href={blogAdminAnalyticsPath()}
        className={
          active === "analytics"
            ? "text-accent-gold"
            : "text-museum-light/50 hover:text-accent-gold"
        }
        aria-current={active === "analytics" ? "page" : undefined}
      >
        Аналитика
      </Link>
      {live ? (
        <span className="ml-auto inline-flex items-center gap-2 text-museum-light/40 normal-case tracking-normal">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/90 animate-pulse" aria-hidden />
          Обновляется автоматически
        </span>
      ) : null}
    </div>
  );
}
