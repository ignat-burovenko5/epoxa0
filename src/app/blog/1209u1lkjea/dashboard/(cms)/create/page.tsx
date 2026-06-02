import type { Metadata } from "next";
import { requireDashboardAuth } from "@/app/blog/1209u1lkjea/dashboard/layout";
import BlogCmsShell from "@/components/blog/cms/BlogCmsShell";
import BlogPostEditor from "@/components/blog/cms/BlogPostEditor";
import { getBlogStore } from "@/lib/blog/store";

export const metadata: Metadata = {
  title: "Новая запись",
  robots: { index: false, follow: false },
};

export default async function BlogCreatePostPage() {
  await requireDashboardAuth();
  const store = await getBlogStore();

  return (
    <BlogCmsShell>
      <BlogPostEditor defaultAuthor={store.settings.defaultAuthor} />
    </BlogCmsShell>
  );
}
