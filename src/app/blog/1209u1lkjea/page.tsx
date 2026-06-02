import type { Metadata } from "next";
import { Suspense } from "react";
import { requireDashboardAuth } from "@/app/blog/1209u1lkjea/dashboard/layout";
import BlogCmsShell from "@/components/blog/cms/BlogCmsShell";
import CmsHub from "@/components/blog/cms/CmsHub";
import { getBlogListPage } from "@/lib/blog/posts";
import { getDashboardOverview } from "@/lib/dashboard/overview";
import { parseOverviewPeriodDays } from "@/lib/dashboard/period";
export const metadata: Metadata = {
  title: "Панель CMS",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ days?: string; date?: string }>;
};

export default async function BlogAdminHubPage({ searchParams }: PageProps) {
  await requireDashboardAuth();
  const { days: daysParam, date: dateParam } = await searchParams;
  const periodDays = parseOverviewPeriodDays(daysParam);
  const [page, overview] = await Promise.all([
    getBlogListPage(0, 100, { includeDrafts: true }),
    getDashboardOverview(periodDays, dateParam),
  ]);

  return (
    <BlogCmsShell>
      <Suspense
        fallback={
          <p className="font-sans text-sm text-museum-light/50 text-center py-12">Загрузка…</p>
        }
      >
        <CmsHub overview={overview} posts={page.items} />
      </Suspense>
    </BlogCmsShell>
  );
}
