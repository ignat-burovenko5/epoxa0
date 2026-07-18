import { NextRequest } from "next/server";
import {
  PRODUCT_MEDIA_DIR,
  PRODUCT_MEDIA_LEGACY_DIR,
} from "@/lib/cms/product-media";
import { serveMediaFile } from "@/lib/cms/serve-media-file";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(_request: NextRequest, context: Ctx) {
  const parts = (await context.params).path ?? [];
  return serveMediaFile([PRODUCT_MEDIA_DIR, PRODUCT_MEDIA_LEGACY_DIR], parts);
}
