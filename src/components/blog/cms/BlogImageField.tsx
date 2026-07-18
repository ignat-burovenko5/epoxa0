"use client";

import { useRef, useState } from "react";
import { cmsLabelClass } from "@/components/blog/cms/cms-field-styles";

type BlogImageFieldProps = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
};

export default function BlogImageField({
  value,
  onChange,
  label = "Обложка",
}: BlogImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function uploadFile(file: File) {
    setUploading(true);
    setUploadError(null);

    const body = new FormData();
    body.append("file", file);
    body.append("kind", "blog");

    try {
      const res = await fetch("/api/cms/upload-image", {
        method: "POST",
        credentials: "same-origin",
        body,
      });
      let data: { url?: string; error?: string } = {};
      try {
        data = (await res.json()) as typeof data;
      } catch {
        data = { error: `Ответ сервера ${res.status}` };
      }
      if (!res.ok || !data.url) {
        setUploadError(data.error ?? "Не удалось загрузить");
        return;
      }
      onChange(data.url);
    } catch {
      setUploadError("Ошибка сети при загрузке");
    } finally {
      setUploading(false);
    }
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void uploadFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) void uploadFile(file);
  }

  const previewSrc = value.trim();

  return (
    <div className="space-y-3">
      <p className={cmsLabelClass}>{label}</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={onFileSelected}
      />

      {previewSrc ? (
        <div className="space-y-3">
          <div className="relative aspect-[16/9] w-full max-w-2xl border border-museum-light/15 bg-luxury-charcoal/40 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary CMS URLs */}
            <img
              src={previewSrc}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="min-h-10 px-4 font-sans text-xs tracking-widest uppercase border border-museum-light/25 text-museum-light/80 hover:border-accent-gold/50 hover:text-accent-gold disabled:opacity-50"
            >
              {uploading ? "Загрузка…" : "Заменить"}
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={() => onChange("")}
              className="min-h-10 px-4 font-sans text-xs tracking-widest uppercase text-museum-light/50 hover:text-red-300/90 disabled:opacity-50"
            >
              Удалить
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center gap-3 w-full max-w-2xl aspect-[16/9] border-2 border-dashed px-6 transition-colors disabled:opacity-50 ${
            dragOver
              ? "border-accent-gold/60 bg-accent-gold/5"
              : "border-museum-light/20 bg-luxury-base/20 hover:border-accent-gold/40 hover:bg-luxury-base/35"
          }`}
        >
          <span className="font-sans text-sm text-museum-light/70">
            {uploading ? "Загрузка…" : "Добавить изображение"}
          </span>
          <span className="font-sans text-xs text-museum-light/40 text-center leading-relaxed">
            Нажмите или перетащите файл
            <br />
            JPEG, PNG, WebP или GIF · до 12 МБ · сжатие AVIF/WebP
          </span>
        </button>
      )}

      {uploadError ? (
        <p className="font-sans text-sm text-red-300/90" role="alert">
          {uploadError}
        </p>
      ) : null}
    </div>
  );
}
