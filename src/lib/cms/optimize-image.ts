import sharp from "sharp";

const MAX_EDGE = 2048;

export type OptimizedImage = {
  buffer: Buffer;
  ext: ".avif" | ".webp";
  mime: "image/avif" | "image/webp";
  width: number;
  height: number;
  originalBytes: number;
  optimizedBytes: number;
};

/**
 * Max-effort encode for CMS uploads: resize longest edge, compare AVIF vs WebP,
 * keep the smaller file.
 */
export async function optimizeCmsImage(input: Buffer): Promise<OptimizedImage> {
  const originalBytes = input.length;
  if (originalBytes <= 0) {
    throw new Error("Пустой файл");
  }

  const source = sharp(input, { failOn: "none" }).rotate();
  const meta = await source.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  let pipeline = sharp(input, { failOn: "none" }).rotate();
  if (width > 0 && height > 0 && Math.max(width, height) > MAX_EDGE) {
    pipeline = pipeline.resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // effort 6 ≈ near-max compression without multi‑tens‑of‑seconds encodes
  const [avif, webp] = await Promise.all([
    pipeline
      .clone()
      .avif({ quality: 40, effort: 6, chromaSubsampling: "4:2:0" })
      .toBuffer({ resolveWithObject: true }),
    pipeline
      .clone()
      .webp({ quality: 68, effort: 6, smartSubsample: true })
      .toBuffer({ resolveWithObject: true }),
  ]);

  const pick =
    avif.data.length <= webp.data.length
      ? {
          buffer: avif.data,
          ext: ".avif" as const,
          mime: "image/avif" as const,
          width: avif.info.width,
          height: avif.info.height,
        }
      : {
          buffer: webp.data,
          ext: ".webp" as const,
          mime: "image/webp" as const,
          width: webp.info.width,
          height: webp.info.height,
        };

  return {
    ...pick,
    originalBytes,
    optimizedBytes: pick.buffer.length,
  };
}
