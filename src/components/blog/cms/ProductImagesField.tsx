"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
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

type PendingUpload = {
  id: string;
  name: string;
  previewUrl: string;
  status: "uploading" | "done" | "error";
  error?: string;
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

/** Circular status: SVG spinner / success / error — always visible on dark CMS. */
function StatusCircle({
  status,
  className = "",
}: {
  status: "uploading" | "done" | "error" | "idle";
  className?: string;
}) {
  if (status === "idle") return null;

  if (status === "uploading") {
    return (
      <span
        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center ${className}`.trim()}
        role="status"
        aria-label="Загрузка"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-full w-full animate-spin text-accent-gold"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth="2.5"
          />
          <path
            d="M21 12a9 9 0 0 0-9-9"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }

  const ring =
    status === "done"
      ? "border-emerald-400/80 bg-emerald-500/15 text-emerald-300"
      : "border-red-400/70 bg-red-500/15 text-red-300";

  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${ring} ${className}`.trim()}
      aria-hidden="true"
    >
      {status === "done" ? (
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
          <path
            d="M3.5 8.2 6.6 11.2 12.5 4.8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
          <path
            d="M4 4l8 8M12 4l-8 8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )}
    </span>
  );
}

function PreviewImage({
  src,
  alt = "",
  className = "",
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [src]);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-luxury-charcoal/60 text-red-300/80 ${className}`}
      >
        <StatusCircle status="error" className="h-8 w-8" />
        <span className="px-2 text-center font-sans text-[10px] tracking-wide uppercase">
          Не удалось показать
        </span>
      </div>
    );
  }

  return (
    <>
      {!loaded ? (
        <span className="absolute inset-0 z-[1] flex items-center justify-center bg-luxury-charcoal/40">
          <StatusCircle status="uploading" className="h-9 w-9" />
        </span>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- CMS preview */}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loaded ? "opacity-100" : "opacity-0"}`}
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </>
  );
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
  const [pending, setPending] = useState<PendingUpload[]>([]);
  /** URLs uploaded in this session — show success circle on their cards. */
  const [justUploaded, setJustUploaded] = useState<Set<string>>(() => new Set());
  const [batchStatus, setBatchStatus] = useState<"idle" | "uploading" | "done" | "error">(
    "idle",
  );
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const urls = useMemo(() => parseUrls(value), [value]);

  useEffect(() => {
    return () => {
      for (const item of pending) {
        if (item.previewUrl.startsWith("blob:")) URL.revokeObjectURL(item.previewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- revoke on unmount only
  }, []);

  function setUrls(next: string[]) {
    onChange(joinUrls(next));
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = [...files].filter((f) => f.type.startsWith("image/"));
    if (!list.length) {
      setUploadError("Выберите файл изображения");
      setBatchStatus("error");
      return;
    }

    const batch: PendingUpload[] = list.map((file, i) => ({
      id: `${Date.now()}-${i}-${file.name}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      status: "uploading" as const,
    }));

    // Paint spinner cards before the first await (sharp can take seconds).
    flushSync(() => {
      setUploading(true);
      setUploadError(null);
      setLastInfo(null);
      setBatchStatus("uploading");
      setPending((prev) => [...prev, ...batch]);
    });

    const added: string[] = [];
    const notes: string[] = [];
    let hadError = false;
    // Capture current URLs at start so concurrent edits don't drop new rows.
    const baseUrls = parseUrls(value);

    try {
      for (let i = 0; i < list.length; i++) {
        const file = list[i]!;
        const item = batch[i]!;
        const body = new FormData();
        body.append("file", file);
        body.append("kind", "product");
        body.append("slug", slug.trim() || "draft");

        try {
          const res = await fetch("/api/cms/upload-image", {
            method: "POST",
            credentials: "same-origin",
            body,
          });
          let data: {
            url?: string;
            error?: string;
            originalBytes?: number;
            optimizedBytes?: number;
            savingsPercent?: number;
          } = {};
          try {
            data = (await res.json()) as typeof data;
          } catch {
            data = { error: `Ответ сервера ${res.status}` };
          }
          if (!res.ok || !data.url) {
            hadError = true;
            setPending((prev) =>
              prev.map((p) =>
                p.id === item.id
                  ? { ...p, status: "error", error: data.error ?? "Ошибка" }
                  : p,
              ),
            );
            setUploadError(data.error ?? `Не удалось загрузить «${file.name}»`);
            continue;
          }

          added.push(data.url);
          setPending((prev) =>
            prev.map((p) => (p.id === item.id ? { ...p, status: "done" } : p)),
          );
          if (
            typeof data.originalBytes === "number" &&
            typeof data.optimizedBytes === "number"
          ) {
            notes.push(
              `${file.name}: ${formatBytes(data.originalBytes)} → ${formatBytes(data.optimizedBytes)} (−${data.savingsPercent ?? 0}%)`,
            );
          }
        } catch {
          hadError = true;
          setPending((prev) =>
            prev.map((p) =>
              p.id === item.id
                ? { ...p, status: "error", error: "Ошибка сети" }
                : p,
            ),
          );
          setUploadError("Ошибка сети при загрузке");
        }
      }

      if (added.length) {
        setUrls([...baseUrls, ...added]);
        setJustUploaded((prev) => {
          const next = new Set(prev);
          for (const url of added) next.add(url);
          return next;
        });
        setLastInfo(notes.join(" · ") || `Загружено: ${added.length}`);
      }
      setBatchStatus(hadError && !added.length ? "error" : "done");
    } finally {
      setUploading(false);
      // Keep pending cards briefly with status, then clear done ones (rendered in main grid)
      window.setTimeout(() => {
        setPending((prev) => {
          for (const p of prev) {
            if (p.status === "done" && p.previewUrl.startsWith("blob:")) {
              URL.revokeObjectURL(p.previewUrl);
            }
          }
          return prev.filter((p) => p.status === "error");
        });
      }, 1200);
    }
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    e.target.value = "";
    if (files?.length) void uploadFiles(files);
  }

  function move(index: number, dir: -1 | 1) {
    moveTo(index, index + dir);
  }

  function moveTo(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || from >= urls.length || to >= urls.length) {
      return;
    }
    const next = [...urls];
    const [item] = next.splice(from, 1);
    if (!item) return;
    next.splice(to, 0, item);
    setUrls(next);
  }

  function makeMain(index: number) {
    moveTo(index, 0);
  }

  function removeAt(index: number) {
    const url = urls[index];
    if (url) {
      setJustUploaded((prev) => {
        const next = new Set(prev);
        next.delete(url);
        return next;
      });
    }
    setUrls(urls.filter((_, i) => i !== index));
  }

  function onReorderDragStart(index: number, e: React.DragEvent) {
    if (uploading) {
      e.preventDefault();
      return;
    }
    setDragFrom(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  }

  function onReorderDragOver(index: number, e: React.DragEvent) {
    if (dragFrom === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) setDragOverIndex(index);
  }

  function onReorderDrop(index: number, e: React.DragEvent) {
    e.preventDefault();
    const from = dragFrom ?? Number(e.dataTransfer.getData("text/plain"));
    if (Number.isFinite(from)) moveTo(from, index);
    setDragFrom(null);
    setDragOverIndex(null);
  }

  function onReorderDragEnd() {
    setDragFrom(null);
    setDragOverIndex(null);
  }

  function dismissPending(id: string) {
    setPending((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={cmsLabelClass}>Изображения товара</p>
          <p className="mt-1 font-sans text-xs text-museum-light/45 leading-relaxed">
            Загрузка с максимальной компрессией (AVIF/WebP). Порядок: первое фото —
            главное на сайте. Перетащите карточку или смените номер.
          </p>
          <p className="mt-1 font-sans text-[11px] text-museum-light/35 truncate">
            media/products/{slug || "draft"}/
          </p>
        </div>
        <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
          <StatusCircle status={batchStatus} />
          {batchStatus === "uploading" ? (
            <span className="font-sans text-[10px] tracking-widest uppercase text-accent-gold/80">
              Загрузка
            </span>
          ) : null}
          {batchStatus === "done" && !uploading ? (
            <span className="font-sans text-[10px] tracking-widest uppercase text-emerald-300/80">
              Готово
            </span>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        multiple
        className="sr-only"
        onChange={onFileSelected}
      />

      {urls.length || pending.length ? (
        <ul className="list-none m-0 p-0 grid grid-cols-2 md:grid-cols-3 gap-3">
          {urls.map((url, index) => {
            const isNew = justUploaded.has(url);
            const isDragTarget = dragOverIndex === index && dragFrom !== index;
            return (
              <li
                key={`${url}-${index}`}
                draggable={!uploading}
                onDragStart={(e) => onReorderDragStart(index, e)}
                onDragOver={(e) => onReorderDragOver(index, e)}
                onDrop={(e) => onReorderDrop(index, e)}
                onDragEnd={onReorderDragEnd}
                className={`border bg-luxury-base/30 overflow-hidden flex flex-col transition-colors ${
                  isDragTarget
                    ? "border-accent-gold/70 ring-1 ring-accent-gold/40"
                    : dragFrom === index
                      ? "border-museum-light/25 opacity-60"
                      : "border-museum-light/15"
                } ${uploading ? "" : "cursor-grab active:cursor-grabbing"}`}
              >
                <div className="relative aspect-[4/5] bg-luxury-charcoal/50">
                  <PreviewImage
                    src={url}
                    className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                  />
                  <span className="absolute left-2 top-2 z-[2] inline-flex h-7 min-w-7 items-center justify-center px-1.5 font-sans text-xs tabular-nums bg-luxury-base/90 text-museum-light border border-museum-light/20">
                    {index + 1}
                  </span>
                  {index === 0 ? (
                    <span className="absolute left-11 top-2 z-[2] font-sans text-[9px] tracking-widest uppercase px-2 py-1.5 bg-luxury-base/85 text-accent-gold border border-accent-gold/30">
                      Главное
                    </span>
                  ) : null}
                  {isNew ? (
                    <span className="absolute right-2 top-2 z-[2] drop-shadow-md">
                      <StatusCircle status="done" className="h-7 w-7 bg-luxury-base/80" />
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 p-2.5 border-t border-museum-light/10">
                  <label className="sr-only" htmlFor={`img-order-${index}`}>
                    Позиция
                  </label>
                  <select
                    id={`img-order-${index}`}
                    disabled={uploading || urls.length < 2}
                    value={index}
                    onChange={(e) => moveTo(index, Number(e.target.value))}
                    className="min-h-9 max-w-[4.5rem] bg-luxury-base border border-museum-light/20 px-1.5 font-sans text-[11px] text-museum-light focus:border-accent-gold/50 focus:outline-none disabled:opacity-40"
                    title="Порядок"
                  >
                    {urls.map((_, pos) => (
                      <option key={pos} value={pos}>
                        {pos + 1}
                        {pos === 0 ? " ★" : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={index === 0 || uploading}
                    onClick={() => move(index, -1)}
                    className="min-h-9 px-2 font-sans text-[10px] tracking-widest uppercase text-museum-light/55 hover:text-accent-gold disabled:opacity-30"
                    title="Раньше"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === urls.length - 1 || uploading}
                    onClick={() => move(index, 1)}
                    className="min-h-9 px-2 font-sans text-[10px] tracking-widest uppercase text-museum-light/55 hover:text-accent-gold disabled:opacity-30"
                    title="Позже"
                  >
                    ↓
                  </button>
                  {index !== 0 ? (
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => makeMain(index)}
                      className="min-h-9 px-2 font-sans text-[10px] tracking-widest uppercase text-accent-gold/80 hover:text-accent-gold disabled:opacity-50"
                      title="Сделать главным"
                    >
                      ★
                    </button>
                  ) : null}
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
            );
          })}

          {pending.map((item) => (
            <li
              key={item.id}
              className="border border-museum-light/15 bg-luxury-base/30 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[4/5] bg-luxury-charcoal/50">
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                <img
                  src={item.previewUrl}
                  alt=""
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity ${
                    item.status === "uploading" ? "opacity-50" : "opacity-90"
                  }`}
                />
                <span className="absolute inset-0 flex items-center justify-center">
                  <StatusCircle
                    status={item.status}
                    className="h-10 w-10 bg-luxury-base/75 shadow-lg"
                  />
                </span>
              </div>
              <div className="flex items-center gap-2 p-2.5 border-t border-museum-light/10">
                <p className="min-w-0 flex-1 font-sans text-[10px] text-museum-light/45 truncate">
                  {item.status === "uploading"
                    ? "Оптимизация…"
                    : item.status === "done"
                      ? "Сохранено"
                      : item.error ?? "Ошибка"}
                </p>
                {item.status === "error" ? (
                  <button
                    type="button"
                    onClick={() => dismissPending(item.id)}
                    className="font-sans text-[10px] tracking-widest uppercase text-museum-light/50 hover:text-accent-gold"
                  >
                    Скрыть
                  </button>
                ) : null}
              </div>
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
        className={`flex flex-col items-center justify-center gap-3 w-full min-h-[8rem] border-2 border-dashed px-6 transition-colors disabled:opacity-50 ${
          dragOver
            ? "border-accent-gold/60 bg-accent-gold/5"
            : "border-museum-light/20 bg-luxury-base/20 hover:border-accent-gold/40 hover:bg-luxury-base/35"
        }`}
      >
        {uploading ? <StatusCircle status="uploading" className="h-9 w-9" /> : null}
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
        <p className="font-sans text-xs text-emerald-300/80 flex items-center gap-2">
          <StatusCircle status="done" className="h-5 w-5" />
          <span>{lastInfo}</span>
        </p>
      ) : null}
      {uploadError ? (
        <p className="font-sans text-sm text-red-300/90 flex items-center gap-2" role="alert">
          <StatusCircle status="error" className="h-5 w-5" />
          <span>{uploadError}</span>
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
