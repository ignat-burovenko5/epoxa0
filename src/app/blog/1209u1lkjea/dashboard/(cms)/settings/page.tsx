import type { Metadata } from "next";
import { requireDashboardAuth } from "@/app/blog/1209u1lkjea/dashboard/layout";
import BlogCmsShell from "@/components/blog/cms/BlogCmsShell";
import BlogSettingsForm from "@/components/blog/cms/BlogSettingsForm";
import { getBlogStore } from "@/lib/blog/store";

export const metadata: Metadata = {
  title: "Настройки блога",
  robots: { index: false, follow: false },
};

export default async function BlogSettingsPage() {
  await requireDashboardAuth();
  const store = await getBlogStore();

  return (
    <BlogCmsShell>
      <BlogSettingsForm settings={store.settings} />
    </BlogCmsShell>
  );
}
