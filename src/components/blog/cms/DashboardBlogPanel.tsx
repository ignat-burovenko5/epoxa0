import Link from "next/link";
import BlogPostList from "@/components/blog/cms/BlogPostList";
import type { DashboardOverview } from "@/lib/dashboard/overview";
import type { BlogPostSummary } from "@/lib/blog/types";
import {
  blogDashboardCreatePath,
  blogIndexPath,
} from "@/lib/blog/urls";

type DashboardBlogPanelProps = {
  blog: DashboardOverview["blog"];
  posts: BlogPostSummary[];
};

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="border border-museum-light/10 bg-luxury-base/40 p-4 md:p-5">
      <p className="font-sans text-[10px] tracking-widest uppercase text-accent-gold/70 mb-2">
        {label}
      </p>
      <p className="font-serif text-2xl md:text-3xl text-museum-light">{value}</p>
      {hint ? (
        <p className="mt-2 font-sans text-xs text-museum-light/45 leading-relaxed">{hint}</p>
      ) : null}
    </div>
  );
}

export default function DashboardBlogPanel({ blog, posts }: DashboardBlogPanelProps) {
  const published = posts.filter((p) => p.status === "published").length;
  const drafts = posts.filter((p) => p.status === "draft").length;

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-serif text-xl md:text-2xl mb-1">Блог</h2>
        <p className="font-sans text-sm text-museum-light/50 mb-6">
          Управление записями и публикациями
        </p>
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
          <StatCard label="Всего" value={blog.totalPosts} />
          <StatCard label="Опубликовано" value={blog.published} />
          <StatCard label="Черновики" value={blog.drafts} />
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={blogDashboardCreatePath()}
            className="min-h-11 px-5 inline-flex items-center font-sans text-xs tracking-widest uppercase bg-accent-gold/90 text-luxury-base hover:bg-accent-gold"
          >
            Новая запись
          </Link>
          <Link
            href={blogIndexPath()}
            className="min-h-11 px-5 inline-flex items-center font-sans text-xs tracking-widest uppercase text-museum-light/50 hover:text-accent-gold"
          >
            Открыть блог на сайте
          </Link>
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="font-serif text-xl md:text-2xl">Все записи</h2>
          <p className="font-sans text-sm text-museum-light/55">
            {published} опубл. · {drafts} черн. · {posts.length} в списке
          </p>
        </div>
        <BlogPostList posts={posts} />
      </section>
    </div>
  );
}
