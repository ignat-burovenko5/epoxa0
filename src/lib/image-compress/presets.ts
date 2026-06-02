export type LabFormat = "webp" | "avif" | "jpeg";

export type CompressPreset = {
  id: string;
  label: string;
  format: LabFormat;
  quality: number;
  /** Cap longest edge (optional). */
  maxEdge?: number;
};

/** Default for site-wide batch compression (chosen in lab). */
export const DEFAULT_LAB_PRESET_ID = "avif-q42";

/** Grid used to find a sweet spot before batch-compressing catalog assets. */
export const COMPRESS_PRESETS: CompressPreset[] = [
  { id: "webp-q90", label: "WebP q90", format: "webp", quality: 90 },
  { id: "webp-q82", label: "WebP q82", format: "webp", quality: 82 },
  { id: "webp-q75", label: "WebP q75", format: "webp", quality: 75 },
  { id: "webp-q68", label: "WebP q68", format: "webp", quality: 68 },
  { id: "webp-q60", label: "WebP q60", format: "webp", quality: 60 },
  { id: "avif-q55", label: "AVIF q55", format: "avif", quality: 55 },
  { id: "avif-q48", label: "AVIF q48", format: "avif", quality: 48 },
  { id: "avif-q42", label: "AVIF q42", format: "avif", quality: 42 },
  { id: "avif-q36", label: "AVIF q36", format: "avif", quality: 36 },
  { id: "jpeg-q88", label: "JPEG q88 (mozjpeg)", format: "jpeg", quality: 88 },
  { id: "jpeg-q80", label: "JPEG q80 (mozjpeg)", format: "jpeg", quality: 80 },
  { id: "jpeg-q72", label: "JPEG q72 (mozjpeg)", format: "jpeg", quality: 72 },
  { id: "jpeg-q64", label: "JPEG q64 (mozjpeg)", format: "jpeg", quality: 64 },
  { id: "webp-1920-q75", label: "WebP q75 · max 1920px", format: "webp", quality: 75, maxEdge: 1920 },
  { id: "webp-1600-q75", label: "WebP q75 · max 1600px", format: "webp", quality: 75, maxEdge: 1600 },
  { id: "webp-1280-q75", label: "WebP q75 · max 1280px", format: "webp", quality: 75, maxEdge: 1280 },
  { id: "avif-1920-q48", label: "AVIF q48 · max 1920px", format: "avif", quality: 48, maxEdge: 1920 },
  { id: "avif-1600-q48", label: "AVIF q48 · max 1600px", format: "avif", quality: 48, maxEdge: 1600 },
  { id: "avif-1280-q48", label: "AVIF q48 · max 1280px", format: "avif", quality: 48, maxEdge: 1280 },
];

export type LabVariantMeta = {
  presetId: string;
  label: string;
  format: LabFormat;
  quality: number;
  maxEdge?: number;
  bytes: number;
  width: number;
  height: number;
  mime: string;
  savingsPercent: number;
};

export type LabRecommendations = {
  smallestId: string;
  /** Within ~12% of smallest size, highest quality — visual/size tradeoff. */
  balancedId: string;
};

export function recommendVariants(
  variants: LabVariantMeta[],
): LabRecommendations | null {
  if (variants.length === 0) return null;

  const bySize = [...variants].sort((a, b) => a.bytes - b.bytes);
  const smallest = bySize[0]!;
  const ceiling = smallest.bytes * 1.12;

  const inBand = variants.filter((v) => v.bytes <= ceiling);
  const balanced = [...inBand].sort((a, b) => b.quality - a.quality || a.bytes - b.bytes)[0]!;

  return { smallestId: smallest.presetId, balancedId: balanced.presetId };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
