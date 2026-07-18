import type { Metadata } from "next";
import { Suspense } from "react";
import { requireDashboardAuth } from "@/app/blog/1209u1lkjea/dashboard/layout";
import BlogCmsShell from "@/components/blog/cms/BlogCmsShell";
import CmsHub from "@/components/blog/cms/CmsHub";
import { getBlogListPage } from "@/lib/blog/posts";
import { getDashboardOverview } from "@/lib/dashboard/overview";
import { parseOverviewPeriodDays } from "@/lib/dashboard/period";
import { getAdminProductList } from "@/lib/shop/products-admin";
import { ADMIN_PRODUCT_PAGE_SIZE } from "@/lib/shop/product-types";

export const metadata: Metadata = {
  title: "Панель CMS",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ days?: string; date?: string; status?: string; view?: string }>;
};

export default async function BlogAdminHubPage({ searchParams }: PageProps) {
  await requireDashboardAuth();
  const {
    days: daysParam,
    date: dateParam,
    status: statusParam,
    view: viewParam,
  } = await searchParams;
  const periodDays = parseOverviewPeriodDays(daysParam);
  const productStatus =
    statusParam === "active" || statusParam === "draft" || statusParam === "archived"
      ? statusParam
      : "all";
  const wide = viewParam === "products";

  // Products: small first page only on products view (infinite scroll loads the rest).
  // Hub home needs counts only — limit 1.
  const [page, overview, productsPage] = await Promise.all([
    getBlogListPage(0, 100, { includeDrafts: true }),
    getDashboardOverview(periodDays, dateParam),
    getAdminProductList({
      limit: wide ? ADMIN_PRODUCT_PAGE_SIZE : 1,
      status: productStatus === "all" ? undefined : productStatus,
    }),
  ]);

  return (
    <BlogCmsShell size={wide ? "wide" : "default"}>
      <Suspense
        fallback={
          <p className="font-sans text-sm text-museum-light/50 text-center py-12">Загрузка…</p>
        }
      >
        <CmsHub
          overview={overview}
          posts={page.items}
          productsPage={productsPage}
          initialProductStatus={productStatus}
        />
      </Suspense>
    </BlogCmsShell>
  );
}
