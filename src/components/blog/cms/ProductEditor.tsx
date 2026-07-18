"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  cmsInputClass,
  cmsLabelClass,
  cmsSectionClass,
  cmsSectionTitleClass,
  cmsTextareaClass,
} from "@/components/blog/cms/cms-field-styles";
import type {
  CatalogProductAdmin,
  CatalogProductInput,
  ProductStatus,
} from "@/lib/shop/product-types";
import { blogAdminProductsPath } from "@/lib/blog/urls";
import { siteConfig } from "@/lib/site";

type ProductEditorProps = {
  product?: CatalogProductAdmin;
};

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/gu, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

const emptyProduct = (): CatalogProductInput => ({
  title: "",
  slug: "",
  era: "",
  category: siteConfig.categoryLinks[0]?.label ?? "",
  description: "",
  price: 0,
  compareAtPrice: null,
  badge: "",
  images: "",
  sourceUrl: "",
  status: "draft",
  featured: false,
  sortOrder: 0,
  adminNotes: "",
});

export default function ProductEditor({ product }: ProductEditorProps) {
  const router = useRouter();
  const isNew = !product;
  const [form, setForm] = useState<CatalogProductInput>(() =>
    product
      ? {
          ...product,
          description: (product.description ?? []).join("\n\n"),
          images: (product.images ?? []).join("\n"),
          compareAtPrice: product.compareAtPrice ?? null,
          badge: product.badge ?? "",
          adminNotes: product.adminNotes ?? "",
        }
      : emptyProduct(),
  );
  const [slugAuto, setSlugAuto] = useState(() => {
    if (!product) return true;
    return !product.slug || product.slug === slugify(product.title);
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryOptions = useMemo(
    () => siteConfig.categoryLinks.map((c) => c.label),
    [],
  );

  function patch<K extends keyof CatalogProductInput>(key: K, value: CatalogProductInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const title = String(form.title || "").trim();
    const payload: CatalogProductInput = {
      ...form,
      title,
      slug: String(form.slug || "").trim() || slugify(title),
      description: String(form.description || ""),
      images: String(form.images || ""),
      compareAtPrice:
        form.compareAtPrice === null || form.compareAtPrice === undefined || form.compareAtPrice === ("" as never)
          ? null
          : Number(form.compareAtPrice),
      price: Number(form.price) || 0,
      sortOrder: Number(form.sortOrder) || 0,
    };

    try {
      const url = isNew
        ? "/api/blog/admin/products"
        : `/api/blog/admin/products/${encodeURIComponent(product!.slug)}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as CatalogProductAdmin & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Не удалось сохранить");
        return;
      }
      router.push(blogAdminProductsPath());
      router.refresh();
    } catch {
      setError("Ошибка сети");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 max-w-5xl">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl xl:text-4xl text-museum-light mb-2">
          {isNew ? "Новый товар" : "Редактирование товара"}
        </h1>
        <p className="font-sans text-sm md:text-base text-museum-light/50 max-w-2xl">
          Активные товары с ценой &gt; 0 появляются в каталоге на сайте.
        </p>
      </div>

      {error ? (
        <p className="font-sans text-sm text-red-300/90" role="alert">
          {error}
        </p>
      ) : null}

      <section className={cmsSectionClass}>
        <h2 className={cmsSectionTitleClass}>Основное</h2>
        <div>
          <label className={cmsLabelClass} htmlFor="title">
            Название
          </label>
          <input
            id="title"
            className={cmsInputClass}
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              patch("title", title);
              if (slugAuto) patch("slug", slugify(title));
            }}
            required
          />
        </div>
        <div>
          <label className={cmsLabelClass} htmlFor="slug">
            Slug (URL)
          </label>
          <input
            id="slug"
            className={cmsInputClass}
            value={form.slug ?? ""}
            onChange={(e) => {
              setSlugAuto(false);
              patch("slug", e.target.value);
            }}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={cmsLabelClass} htmlFor="status">
              Статус
            </label>
            <select
              id="status"
              className={cmsInputClass}
              value={form.status ?? "draft"}
              onChange={(e) => patch("status", e.target.value as ProductStatus)}
            >
              <option value="active">На сайте</option>
              <option value="draft">Черновик</option>
              <option value="archived">Архив</option>
            </select>
          </div>
          <div>
            <label className={cmsLabelClass} htmlFor="sortOrder">
              Порядок
            </label>
            <input
              id="sortOrder"
              type="number"
              className={cmsInputClass}
              value={form.sortOrder ?? 0}
              onChange={(e) => patch("sortOrder", Number(e.target.value))}
            />
          </div>
        </div>
        <label className="flex items-center gap-3 font-sans text-sm text-museum-light/80">
          <input
            type="checkbox"
            checked={Boolean(form.featured)}
            onChange={(e) => patch("featured", e.target.checked)}
            className="accent-accent-gold"
          />
          Избранный на главной
        </label>
      </section>

      <section className={cmsSectionClass}>
        <h2 className={cmsSectionTitleClass}>Категория и эпоха</h2>
        <div>
          <label className={cmsLabelClass} htmlFor="category">
            Категория
          </label>
          <input
            id="category"
            list="category-options"
            className={cmsInputClass}
            value={form.category ?? ""}
            onChange={(e) => patch("category", e.target.value)}
          />
          <datalist id="category-options">
            {categoryOptions.map((label) => (
              <option key={label} value={label} />
            ))}
          </datalist>
        </div>
        <div>
          <label className={cmsLabelClass} htmlFor="era">
            Эпоха / период
          </label>
          <input
            id="era"
            className={cmsInputClass}
            value={form.era ?? ""}
            onChange={(e) => patch("era", e.target.value)}
          />
        </div>
        <div>
          <label className={cmsLabelClass} htmlFor="badge">
            Бейдж (опционально)
          </label>
          <input
            id="badge"
            className={cmsInputClass}
            value={form.badge ?? ""}
            onChange={(e) => patch("badge", e.target.value)}
          />
        </div>
      </section>

      <section className={cmsSectionClass}>
        <h2 className={cmsSectionTitleClass}>Цены</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={cmsLabelClass} htmlFor="price">
              Цена (₽)
            </label>
            <input
              id="price"
              type="number"
              min={0}
              step={1}
              className={cmsInputClass}
              value={form.price ?? 0}
              onChange={(e) => patch("price", Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label className={cmsLabelClass} htmlFor="compareAtPrice">
              Старая цена (₽)
            </label>
            <input
              id="compareAtPrice"
              type="number"
              min={0}
              step={1}
              className={cmsInputClass}
              value={form.compareAtPrice ?? ""}
              onChange={(e) =>
                patch(
                  "compareAtPrice",
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
            />
          </div>
        </div>
      </section>

      <section className={cmsSectionClass}>
        <h2 className={cmsSectionTitleClass}>Описание</h2>
        <div>
          <label className={cmsLabelClass} htmlFor="description">
            Текст (абзацы через пустую строку)
          </label>
          <textarea
            id="description"
            className={`${cmsTextareaClass} min-h-[180px]`}
            value={typeof form.description === "string" ? form.description : ""}
            onChange={(e) => patch("description", e.target.value)}
          />
        </div>
      </section>

      <section className={cmsSectionClass}>
        <h2 className={cmsSectionTitleClass}>Изображения</h2>
        <div>
          <label className={cmsLabelClass} htmlFor="images">
            URL изображений (по одному на строку)
          </label>
          <textarea
            id="images"
            className={cmsTextareaClass}
            placeholder="/products/slug/main.jpg"
            value={typeof form.images === "string" ? form.images : ""}
            onChange={(e) => patch("images", e.target.value)}
          />
        </div>
        <div>
          <label className={cmsLabelClass} htmlFor="sourceUrl">
            Исходный URL
          </label>
          <input
            id="sourceUrl"
            className={cmsInputClass}
            value={form.sourceUrl ?? ""}
            onChange={(e) => patch("sourceUrl", e.target.value)}
          />
        </div>
      </section>

      <section className={cmsSectionClass}>
        <h2 className={cmsSectionTitleClass}>Заметки (только админ)</h2>
        <textarea
          className={cmsTextareaClass}
          value={form.adminNotes ?? ""}
          onChange={(e) => patch("adminNotes", e.target.value)}
          placeholder="Внутренние заметки о товаре"
        />
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="min-h-11 px-6 font-sans text-xs tracking-widest uppercase bg-accent-gold/90 text-luxury-base hover:bg-accent-gold disabled:opacity-50"
        >
          {saving ? "Сохранение…" : "Сохранить"}
        </button>
        <button
          type="button"
          onClick={() => router.push(blogAdminProductsPath())}
          className="min-h-11 px-6 font-sans text-xs tracking-widest uppercase border border-museum-light/25 text-museum-light/70 hover:border-accent-gold/40"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
