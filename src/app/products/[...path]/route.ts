import { createReadStream, existsSync, statSync } from "fs";
import path from "path";
import { Readable } from "stream";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const PRODUCTS_ROOT = path.join(process.cwd(), "public", "products");

const MIME: Record<string, string> = {
  ".avif": "image/avif",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
};

function safeResolve(parts: string[]): string | null {
  const joined = path.join(PRODUCTS_ROOT, ...parts);
  const resolved = path.resolve(joined);
  if (!resolved.startsWith(path.resolve(PRODUCTS_ROOT) + path.sep)) {
    return null;
  }
  return resolved;
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const segments = (await context.params).path ?? [];
  if (!segments.length || segments.some((s) => s.includes("..") || s.includes("\0"))) {
    return new NextResponse("Not found", { status: 404 });
  }

  const abs = safeResolve(segments);
  if (!abs || !existsSync(abs)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const st = statSync(abs);
  if (!st.isFile()) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = path.extname(abs).toLowerCase();
  const mime = MIME[ext] ?? "application/octet-stream";
  const stream = createReadStream(abs);
  const webStream = Readable.toWeb(stream) as unknown as ReadableStream;

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Content-Length": String(st.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
