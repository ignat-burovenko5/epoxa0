import { NextRequest } from "next/server";
import { BLOG_MEDIA_DIR, BLOG_MEDIA_LEGACY_DIR } from "@/lib/cms/product-media";
import { serveMediaFile } from "@/lib/cms/serve-media-file";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(_request: NextRequest, context: Ctx) {
  const parts = (await context.params).path ?? [];
  return serveMediaFile([BLOG_MEDIA_DIR, BLOG_MEDIA_LEGACY_DIR], parts);
}
