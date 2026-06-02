import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import BlogLoginForm from "@/components/blog/cms/BlogLoginForm";
import PageContainer from "@/components/PageContainer";
import { getBlogSession } from "@/lib/blog/auth";
import { blogAdminHubPath, blogIndexPath } from "@/lib/blog/urls";

export const metadata: Metadata = {
  title: "Вход в CMS",
  robots: { index: false, follow: false },
};

export default async function BlogLoginPage() {
  const session = await getBlogSession();
  if (session) {
    redirect(blogAdminHubPath());
  }

  return (
    <main className="bg-luxury-base text-museum-light min-h-[50vh]">
      <PageContainer className="py-12 md:py-16 max-w-lg">
        <p className="font-sans text-[10px] tracking-widest uppercase text-accent-gold/70 text-center mb-2">
          Блог · CMS
        </p>
        <h1 className="font-serif text-2xl md:text-3xl text-center mb-8">Вход</h1>
        <BlogLoginForm />
        <p className="text-center mt-8">
          <Link
            href={blogIndexPath()}
            className="font-sans text-xs tracking-widest uppercase text-museum-light/50 hover:text-accent-gold"
          >
            ← К блогу
          </Link>
        </p>
      </PageContainer>
    </main>
  );
}
