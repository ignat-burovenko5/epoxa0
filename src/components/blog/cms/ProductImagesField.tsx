"use client";

import { useMemo, useRef, useState } from "react";
import {
  cmsLabelClass,
  cmsTextareaClass,
} from "@/components/blog/cms/cms-field-styles";
import { formatBytes } from "@/lib/image-compress/presets";

type ProductImagesFieldProps = {
  value: string;
  onChange: (urlsText: string) => void;
  slug: string;
};

function parseUrls(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function joinUrls(urls: string[]): string {
  return urls.join("\n");
}

export default function ProductImagesField({
  value,
  onChange,
  slug,
}: ProductImagesFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastInfo, setLastInfo] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const urls = useMemo(() => parseUrls(value), [value]);

  function setUrls(next: string[]) {
    onChange(joinUrls(next));
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = [...files].filter((f) => f.type.startsWith("image/"));
    if (!list.length) {
      setUploadError("Выберите файл изображения");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setLastInfo(null);

    const added: string[] = [];
    const notes: string[] = [];

    try {
      for (const file of list) {
        const body = new FormData();
        body.append("file", file);
        body.append("kind", "product");
        body.append("slug", slug.trim() || "draft");

        const res = await fetch("/api/cms/upload-image", {
          method: "POST",
          credentials: "same-origin",
          body,
        });
        const data = (await res.json()) as {
          url?: string;
          error?: string;
          originalBytes?: number;
          optimizedBytes?: number;
          savingsPercent?: number;
          width?: number;
          height?: number;
        };
        if (!res.ok || !data.url) {
          setUploadError(data.error ?? `Не удалось загрузить «${file.name}»`);
          break;
        }
        added.push(data.url);
        if (
          typeof data.originalBytes === "number" &&
          typeof data.optimizedBytes === "number"
        ) {
          notes.push(
            `${file.name}: ${formatBytes(data.originalBytes)} → ${formatBytes(data.optimizedBytes)} (−${data.savingsPercent ?? 0}%)`,
          );
        }
      }

      if (added.length) {
        setUrls([...urls, ...added]);
        setLastInfo(notes.join(" · ") || `Загружено: ${added.length}`);
      }
    } catch {
      setUploadError("Ошибка сети при загрузке");
    } finally {
      setUploading(false);
    }
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    e.target.value = "";
    if (files?.length) void uploadFiles(files);
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...urls];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setUrls(next);
  }

  function removeAt(index: number) {
    setUrls(urls.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <div>
        <p className={cmsLabelClass}>Изображения товара</p>
        <p className="mt-1 font-sans text-xs text-museum-light/45 leading-relaxed">
          Загрузка с максимальной компрессией (AVIF/WebP). Файлы:{" "}
          <span className="text-museum-light/60">public/products/{slug || "draft"}/</span>
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        multiple
        className="sr-only"
        onChange={onFileSelected}
      />

      {urls.length ? (
        <ul className="list-none m-0 p-0 grid grid-cols-2 md:grid-cols-3 gap-3">
          {urls.map((url, index) => (
            <li
              key={`${url}-${index}`}
              className="border border-museum-light/15 bg-luxury-base/30 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[4/5] bg-luxury-charcoal/50">
                {/* eslint-disable-next-line @next/next/no-img-element -- CMS preview of local/remote URLs */}
                <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                {index === 0 ? (
                  <span className="absolute left-2 top-2 font-sans text-[9px] tracking-widest uppercase px-2 py-1 bg-luxury-base/85 text-accent-gold border border-accent-gold/30">
                    Главное
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-1.5 p-2.5 border-t border-museum-light/10">
                <button
                  type="button"
                  disabled={index === 0 || uploading}
                  onClick={() => move(index, -1)}
                  className="min-h-9 px-2 font-sans text-[10px] tracking-widest uppercase text-museum-light/55 hover:text-accent-gold disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  disabled={index === urls.length - 1 || uploading}
                  onClick={() => move(index, 1)}
                  className="min-h-9 px-2 font-sans text-[10px] tracking-widest uppercase text-museum-light/55 hover:text-accent-gold disabled:opacity-30"
                >
                  →
                </button>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => removeAt(index)}
                  className="min-h-9 px-2 ml-auto font-sans text-[10px] tracking-widest uppercase text-red-300/70 hover:text-red-200 disabled:opacity-50"
                >
                  Удал.
                </button>
              </div>
              <p className="px-2.5 pb-2 font-sans text-[10px] text-museum-light/30 truncate">
                {url}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) void uploadFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2 w-full min-h-[8rem] border-2 border-dashed px-6 transition-colors disabled:opacity-50 ${
          dragOver
            ? "border-accent-gold/60 bg-accent-gold/5"
            : "border-museum-light/20 bg-luxury-base/20 hover:border-accent-gold/40 hover:bg-luxury-base/35"
        }`}
      >
        <span className="font-sans text-sm text-museum-light/70">
          {uploading ? "Оптимизация и загрузка…" : "Добавить изображения"}
        </span>
        <span className="font-sans text-xs text-museum-light/40 text-center leading-relaxed">
          Нажмите или перетащите · JPEG/PNG/WebP/GIF · до 12 МБ
          <br />
          На сервере сохраняется сжатый AVIF или WebP
        </span>
      </button>

      {lastInfo ? (
        <p className="font-sans text-xs text-emerald-300/80">{lastInfo}</p>
      ) : null}
      {uploadError ? (
        <p className="font-sans text-sm text-red-300/90" role="alert">
          {uploadError}
        </p>
      ) : null}

      <div>
        <button
          type="button"
          onClick={() => setShowManual((v) => !v)}
          className="font-sans text-[11px] tracking-widest uppercase text-museum-light/45 hover:text-accent-gold"
        >
          {showManual ? "Скрыть URL" : "Вручную (URL)"}
        </button>
        {showManual ? (
          <textarea
            className={`${cmsTextareaClass} mt-2`}
            placeholder="/products/slug/main.webp"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : null}
      </div>
    </div>
  );
}
