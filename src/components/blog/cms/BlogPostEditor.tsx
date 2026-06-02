"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import BlogImageField from "@/components/blog/cms/BlogImageField";
import {
  cmsInputClass,
  cmsLabelClass,
  cmsSectionClass,
  cmsSectionTitleClass,
  cmsTextareaClass,
} from "@/components/blog/cms/cms-field-styles";
import type {
  BlogPost,
  BlogPostInput,
  BlogPostStatus,
} from "@/lib/blog/types";
import { blogDateToday, slugifyTitle } from "@/lib/blog/format";
import { blogDashboardPath } from "@/lib/blog/urls";

type BlogPostEditorProps = {
  post?: BlogPost;
  defaultAuthor?: string;
};

const emptyPost = (author?: string): BlogPostInput => ({
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  bodyFormat: "plain",
  date: blogDateToday(),
  status: "draft",
  author: author ?? "",
  tags: [],
  featured: false,
  coverImage: undefined,
  display: {
    showDate: true,
    showAuthor: true,
    showTags: true,
    showCover: true,
  },
});

export default function BlogPostEditor({ post, defaultAuthor }: BlogPostEditorProps) {
  const router = useRouter();
  const isNew = !post;
  const [form, setForm] = useState<BlogPostInput>(() =>
    post
      ? { ...post }
      : emptyPost(defaultAuthor),
  );
  const [coverSrc, setCoverSrc] = useState(post?.coverImage?.src ?? "");
  const [slugAuto, setSlugAuto] = useState(() => {
    if (!post) return true;
    const slug = post.slug?.trim() ?? "";
    return !slug || slug === slugifyTitle(post.title);
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch<K extends keyof BlogPostInput>(key: K, value: BlogPostInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const title = form.title.trim();
    const payload: BlogPostInput = {
      ...form,
      title,
      slug: form.slug?.trim() || slugifyTitle(title),
      seo: form.seo?.noIndex ? { noIndex: true } : {},
      coverImage: coverSrc.trim()
        ? {
            src: coverSrc.trim(),
            alt: form.title.trim() || "Обложка",
            ...(post?.coverImage?.position ? { position: post.coverImage.position } : {}),
          }
        : undefined,
    };

    try {
      const url = isNew
        ? "/api/blog/admin/posts"
        : `/api/blog/admin/posts/${post!.uid}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as BlogPost & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Не удалось сохранить");
        return;
      }
      router.push(blogDashboardPath());
    } catch {
      setError("Ошибка сети");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {error ? (
        <p className="font-sans text-sm text-red-300/90" role="alert">
          {error}
        </p>
      ) : null}

      <section className={cmsSectionClass}>
        <h2 className={cmsSectionTitleClass}>Основное</h2>
        <div>
          <label htmlFor="title" className={cmsLabelClass}>
            Заголовок *
          </label>
          <input
            id="title"
            required
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm((prev) => ({
                ...prev,
                title,
                ...(slugAuto ? { slug: slugifyTitle(title) } : {}),
              }));
            }}
            className={cmsInputClass}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <label htmlFor="slug" className={`${cmsLabelClass} mb-0`}>
                URL-slug
              </label>
              {!slugAuto ? (
                <button
                  type="button"
                  onClick={() => {
                    setSlugAuto(true);
                    patch("slug", slugifyTitle(form.title));
                  }}
                  className="font-sans text-[10px] tracking-widest uppercase text-museum-light/45 hover:text-accent-gold"
                >
                  из заголовка
                </button>
              ) : null}
            </div>
            <input
              id="slug"
              value={form.slug ?? ""}
              onChange={(e) => {
                setSlugAuto(false);
                patch("slug", e.target.value);
              }}
              placeholder={slugAuto ? "обновляется из заголовка" : "свой slug"}
              className={`${cmsInputClass}${slugAuto ? " text-museum-light/60" : ""}`}
            />
          </div>
          <div>
            <label htmlFor="status" className={cmsLabelClass}>
              Статус
            </label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => patch("status", e.target.value as BlogPostStatus)}
              className={cmsInputClass}
            >
              <option value="draft">Черновик</option>
              <option value="published">Опубликовано</option>
              <option value="archived">Архив</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="excerpt" className={cmsLabelClass}>
            Краткое описание
          </label>
          <textarea
            id="excerpt"
            value={form.excerpt}
            onChange={(e) => patch("excerpt", e.target.value)}
            className={cmsTextareaClass}
            rows={3}
          />
        </div>
        <div>
          <label htmlFor="body" className={cmsLabelClass}>
            Текст
          </label>
          <textarea
            id="body"
            value={form.body}
            onChange={(e) => patch("body", e.target.value)}
            className={`${cmsTextareaClass} min-h-[280px] font-mono text-[13px]`}
            rows={14}
          />
        </div>
        <div>
          <label htmlFor="date" className={cmsLabelClass}>
            Дата (ДД.ММ.ГГГГ)
          </label>
          <input
            id="date"
            value={form.date ?? ""}
            onChange={(e) => patch("date", e.target.value)}
            placeholder="02.06.2026"
            className={cmsInputClass}
          />
        </div>
      </section>

      <section className={cmsSectionClass}>
        <BlogImageField value={coverSrc} onChange={setCoverSrc} />
      </section>

      <div className="flex flex-wrap gap-4">
        <button
          type="submit"
          disabled={saving}
          className="min-h-12 px-8 font-sans text-xs tracking-widest uppercase bg-accent-gold/90 text-luxury-base hover:bg-accent-gold disabled:opacity-50"
        >
          {saving ? "Сохранение…" : isNew ? "Создать" : "Сохранить"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="min-h-12 px-6 font-sans text-xs tracking-widest uppercase text-museum-light/50 hover:text-accent-gold"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
