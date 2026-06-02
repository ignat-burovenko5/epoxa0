"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  DEFAULT_LAB_PRESET_ID,
  formatBytes,
  type LabRecommendations,
  type LabVariantMeta,
} from "@/lib/image-compress/presets";

type SourceInfo = {
  width: number;
  height: number;
  format?: string;
  bytes: number;
  fileName: string;
  mime: string;
};

type VariantRow = LabVariantMeta & { dataUrl: string };

type LabResponse = {
  source: SourceInfo;
  variants: VariantRow[];
  recommendations: LabRecommendations | null;
};

function badgeClass(active: boolean) {
  return active
    ? "border-accent-brass bg-accent-brass/15 text-museum-light"
    : "border-museum-stone/30 bg-luxury-charcoal text-museum-warm hover:border-museum-stone/50";
}

export default function ImageCompressLab() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [result, setResult] = useState<LabResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(
    () => result?.variants.find((v) => v.presetId === selectedId) ?? null,
    [result, selectedId],
  );

  const reset = useCallback(() => {
    setResult(null);
    setSelectedId(null);
    setError(null);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalUrl(null);
  }, [originalUrl]);

  const runLab = useCallback(async (file: File) => {
    reset();
    setLoading(true);
    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setOriginalUrl(objectUrl);

    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/image-lab/compress", {
        method: "POST",
        body,
      });
      const data = (await res.json()) as LabResponse & { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setResult(data);
      const pick =
        data.variants.find((v) => v.presetId === DEFAULT_LAB_PRESET_ID)?.presetId ??
        data.variants[0]?.presetId ??
        null;
      setSelectedId(pick);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compression failed");
    } finally {
      setLoading(false);
    }
  }, [reset]);

  const onFile = useCallback(
    (file: File | null) => {
      if (!file) return;
      void runLab(file);
    },
    [runLab],
  );

  const downloadSelected = useCallback(() => {
    if (!selected) return;
    const a = document.createElement("a");
    a.href = selected.dataUrl;
    const ext = selected.format === "jpeg" ? "jpg" : selected.format;
    a.download = `compressed-${selected.presetId}.${ext}`;
    a.click();
  }, [selected]);

  const rec = result?.recommendations;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <header className="mb-8 border-b border-museum-stone/20 pb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-accent-gold-on-light">
          Internal · image lab
        </p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl text-museum-light">
          Сжатие изображений
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-museum-warm leading-relaxed">
          Загрузите фото — сравнение по умолчанию в <strong className="text-museum-light">AVIF q42</strong>.
          Ниже можно переключить другие пресеты в таблице.
        </p>
      </header>

      <div
        className="rounded-lg border border-dashed border-museum-stone/40 bg-luxury-charcoal/80 p-8 text-center"
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          onFile(file ?? null);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          className="rounded border border-accent-brass px-6 py-3 text-sm uppercase tracking-wider text-museum-light transition hover:bg-accent-brass/20 disabled:opacity-50"
        >
          {loading ? "Обработка…" : "Выбрать изображение"}
        </button>
        <p className="mt-3 text-xs text-museum-stone">или перетащите файл сюда · до 25 MB</p>
      </div>

      {error ? (
        <p className="mt-4 rounded border border-luxury-bordeaux/60 bg-luxury-bordeaux/20 px-4 py-3 text-sm text-museum-light">
          {error}
        </p>
      ) : null}

      {result && originalUrl && selected ? (
        <>
          <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <Stat label="Исходник" value={result.source.fileName} />
            <Stat
              label="Размер файла"
              value={`${formatBytes(result.source.bytes)} → ${formatBytes(selected.bytes)} (−${selected.savingsPercent}%)`}
            />
            <Stat
              label="Пиксели"
              value={`${result.source.width}×${result.source.height} → ${selected.width}×${selected.height}`}
            />
            <Stat label="Пресет" value={selected.label} />
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-serif text-xl text-museum-light">Оригинал и AVIF q42</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ComparePane
                title="Оригинал"
                meta={`${formatBytes(result.source.bytes)} · ${result.source.width}×${result.source.height}`}
                src={originalUrl}
                alt="Оригинал"
              />
              <ComparePane
                title={selected.label}
                meta={`${formatBytes(selected.bytes)} · ${selected.width}×${selected.height} · −${selected.savingsPercent}%`}
                src={selected.dataUrl}
                alt="AVIF q42"
                highlight
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={downloadSelected}
                className="rounded border border-museum-stone/40 px-4 py-2 text-xs uppercase tracking-wider text-museum-light hover:border-accent-brass"
              >
                Скачать выбранный вариант
              </button>
              <button
                type="button"
                onClick={() => {
                  reset();
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="rounded border border-transparent px-4 py-2 text-xs uppercase tracking-wider text-museum-stone hover:text-museum-warm"
              >
                Сбросить
              </button>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-serif text-xl text-museum-light mb-4">
              Все варианты (по размеру файла)
            </h2>
            {rec ? (
              <p className="mb-4 text-sm text-museum-warm">
                Рекомендации:{" "}
                <span className="text-accent-gold">минимальный размер</span> —{" "}
                {result.variants.find((v) => v.presetId === rec.smallestId)?.label};{" "}
                <span className="text-accent-gold">баланс качества/веса</span> —{" "}
                {result.variants.find((v) => v.presetId === rec.balancedId)?.label}
                {" "}(до +12% к самому лёгкому, выше quality).
              </p>
            ) : null}
            <div className="overflow-x-auto rounded-lg border border-museum-stone/20">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-luxury-charcoal text-xs uppercase tracking-wider text-museum-stone">
                  <tr>
                    <th className="px-3 py-2">Пресет</th>
                    <th className="px-3 py-2">Формат</th>
                    <th className="px-3 py-2">Q</th>
                    <th className="px-3 py-2">px</th>
                    <th className="px-3 py-2">Размер</th>
                    <th className="px-3 py-2">Экономия</th>
                  </tr>
                </thead>
                <tbody>
                  {result.variants.map((row) => {
                    const isSelected = row.presetId === selectedId;
                    const isSmallest = row.presetId === rec?.smallestId;
                    const isBalanced = row.presetId === rec?.balancedId;
                    const isDefault = row.presetId === DEFAULT_LAB_PRESET_ID;
                    return (
                      <tr
                        key={row.presetId}
                        className={`cursor-pointer border-t border-museum-stone/10 transition ${
                          isSelected ? "bg-accent-brass/10" : "hover:bg-luxury-charcoal/80"
                        }`}
                        onClick={() => setSelectedId(row.presetId)}
                      >
                        <td className="px-3 py-2.5">
                          <span className="flex flex-wrap items-center gap-2">
                            {row.label}
                            {isDefault ? (
                              <span className={`rounded px-1.5 py-0.5 text-[10px] uppercase ${badgeClass(true)}`}>
                                site
                              </span>
                            ) : null}
                            {isSmallest ? (
                              <span className={`rounded px-1.5 py-0.5 text-[10px] uppercase ${badgeClass(false)}`}>
                                min
                              </span>
                            ) : null}
                            {isBalanced ? (
                              <span className={`rounded px-1.5 py-0.5 text-[10px] uppercase ${badgeClass(false)}`}>
                                pick
                              </span>
                            ) : null}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-museum-warm">{row.format}</td>
                        <td className="px-3 py-2.5">{row.quality}</td>
                        <td className="px-3 py-2.5 text-museum-warm">
                          {row.width}×{row.height}
                          {row.maxEdge ? ` · ≤${row.maxEdge}` : ""}
                        </td>
                        <td className="px-3 py-2.5 font-medium">{formatBytes(row.bytes)}</td>
                        <td className="px-3 py-2.5 text-accent-gold">−{row.savingsPercent}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function ComparePane({
  title,
  meta,
  src,
  alt,
  highlight = false,
}: {
  title: string;
  meta: string;
  src: string;
  alt: string;
  highlight?: boolean;
}) {
  return (
    <figure
      className={`flex flex-col overflow-hidden rounded-lg border bg-black ${
        highlight ? "border-accent-brass/60" : "border-museum-stone/25"
      }`}
    >
      <figcaption className="border-b border-museum-stone/20 bg-luxury-charcoal px-3 py-2">
        <p className="text-sm font-medium text-museum-light">{title}</p>
        <p className="text-xs text-museum-stone">{meta}</p>
      </figcaption>
      <div className="relative aspect-[4/3] w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-contain" />
      </div>
    </figure>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-museum-stone/20 bg-luxury-charcoal/60 px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-museum-stone">{label}</p>
      <p className="mt-1 text-museum-light break-all">{value}</p>
    </div>
  );
}
