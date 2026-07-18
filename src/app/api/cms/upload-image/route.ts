import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/blog/auth";
import { optimizeCmsImage } from "@/lib/cms/optimize-image";
import {
  sanitizeProductSlug,
  saveOptimizedBlogImage,
  saveOptimizedProductImage,
} from "@/lib/cms/product-media";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 12 * 1024 * 1024;

export async function POST(request: NextRequest) {
  if (!getSessionFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Некорректные данные формы" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Выберите файл изображения" }, { status: 400 });
  }

  const kind = String(form.get("kind") || "product").toLowerCase();
  if (kind !== "product" && kind !== "blog") {
    return NextResponse.json({ error: "Неизвестный тип загрузки" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Допустимы только изображения" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length === 0) {
    return NextResponse.json({ error: "Пустой файл" }, { status: 400 });
  }
  if (buffer.length > MAX_BYTES) {
    return NextResponse.json(
      { error: `Файл слишком большой (макс. ${MAX_BYTES / (1024 * 1024)} МБ)` },
      { status: 413 },
    );
  }

  try {
    const optimized = await optimizeCmsImage(buffer);
    const saved =
      kind === "blog"
        ? await saveOptimizedBlogImage({
            buffer: optimized.buffer,
            ext: optimized.ext,
          })
        : await saveOptimizedProductImage({
            slug: sanitizeProductSlug(String(form.get("slug") || "draft")),
            buffer: optimized.buffer,
            ext: optimized.ext,
            preferredName: file.name,
          });

    const savingsPercent =
      Math.round((1 - optimized.optimizedBytes / optimized.originalBytes) * 1000) / 10;

    return NextResponse.json(
      {
        url: saved.url,
        filename: saved.filename,
        mime: optimized.mime,
        width: optimized.width,
        height: optimized.height,
        originalBytes: optimized.originalBytes,
        optimizedBytes: optimized.optimizedBytes,
        savingsPercent,
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ошибка обработки изображения";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
