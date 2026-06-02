import sharp from "sharp";
import {
  COMPRESS_PRESETS,
  type CompressPreset,
  type LabFormat,
  type LabVariantMeta,
} from "@/lib/image-compress/presets";

export type EncodedVariant = LabVariantMeta & {
  dataBase64: string;
};

const MIME: Record<LabFormat, string> = {
  webp: "image/webp",
  avif: "image/avif",
  jpeg: "image/jpeg",
};

function resizeOptions(width: number, height: number, maxEdge?: number) {
  if (!maxEdge) return null;
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return null;
  return { width: maxEdge, height: maxEdge, fit: "inside" as const, withoutEnlargement: true };
}

async function encodeOne(
  input: Buffer,
  meta: { width: number; height: number },
  preset: CompressPreset,
): Promise<EncodedVariant> {
  let pipeline = sharp(input, { failOn: "none" }).rotate();

  const resize = resizeOptions(meta.width, meta.height, preset.maxEdge);
  if (resize) {
    pipeline = pipeline.resize(resize);
  }

  switch (preset.format) {
    case "webp":
      pipeline = pipeline.webp({ quality: preset.quality, effort: 6 });
      break;
    case "avif":
      pipeline = pipeline.avif({ quality: preset.quality, effort: 6 });
      break;
    case "jpeg":
      pipeline = pipeline.jpeg({
        quality: preset.quality,
        mozjpeg: true,
        chromaSubsampling: "4:2:0",
      });
      break;
  }

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  const originalBytes = input.length;

  return {
    presetId: preset.id,
    label: preset.label,
    format: preset.format,
    quality: preset.quality,
    maxEdge: preset.maxEdge,
    bytes: data.length,
    width: info.width,
    height: info.height,
    mime: MIME[preset.format],
    savingsPercent: Math.round((1 - data.length / originalBytes) * 1000) / 10,
    dataBase64: data.toString("base64"),
  };
}

export type SourceMeta = {
  width: number;
  height: number;
  format?: string;
  bytes: number;
};

export async function analyzeSource(input: Buffer): Promise<SourceMeta> {
  const image = sharp(input, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  return {
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    format: meta.format,
    bytes: input.length,
  };
}

const BATCH = 6;

export async function encodeAllPresets(input: Buffer): Promise<{
  source: SourceMeta;
  variants: EncodedVariant[];
}> {
  const source = await analyzeSource(input);
  const variants: EncodedVariant[] = [];

  for (let i = 0; i < COMPRESS_PRESETS.length; i += BATCH) {
    const chunk = COMPRESS_PRESETS.slice(i, i + BATCH);
    const batch = await Promise.all(
      chunk.map((preset) => encodeOne(input, source, preset)),
    );
    variants.push(...batch);
  }

  variants.sort((a, b) => a.bytes - b.bytes);
  return { source, variants };
}
