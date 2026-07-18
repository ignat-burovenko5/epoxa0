import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireDashboardAuth } from "@/app/blog/1209u1lkjea/dashboard/layout";
import BlogCmsShell from "@/components/blog/cms/BlogCmsShell";
import ProductEditor from "@/components/blog/cms/ProductEditor";
import { getAdminProduct } from "@/lib/shop/products-admin";

export const metadata: Metadata = {
  title: "Редактирование товара",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductEditPage({ params }: PageProps) {
  await requireDashboardAuth();
  const { slug } = await params;
  const product = await getAdminProduct(decodeURIComponent(slug));
  if (!product) notFound();

  return (
    <BlogCmsShell>
      <ProductEditor product={product} />
    </BlogCmsShell>
  );
}
