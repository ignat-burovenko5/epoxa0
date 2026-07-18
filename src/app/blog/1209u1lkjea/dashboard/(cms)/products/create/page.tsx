import type { Metadata } from "next";
import { requireDashboardAuth } from "@/app/blog/1209u1lkjea/dashboard/layout";
import BlogCmsShell from "@/components/blog/cms/BlogCmsShell";
import ProductEditor from "@/components/blog/cms/ProductEditor";

export const metadata: Metadata = {
  title: "Новый товар",
  robots: { index: false, follow: false },
};

export default async function ProductCreatePage() {
  await requireDashboardAuth();

  return (
    <BlogCmsShell size="wide">
      <ProductEditor />
    </BlogCmsShell>
  );
}
