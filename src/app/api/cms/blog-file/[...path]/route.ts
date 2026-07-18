import { createReadStream, existsSync, statSync } from "fs";
import path from "path";
import { Readable } from "stream";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ROOT = path.join(process.cwd(), "public", "blog", "uploads");

const MIME: Record<string, string> = {
  ".avif": "image/avif",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
};

function resolveSafe(parts: string[]): string | null {
  if (!parts.length || parts.some((s) => !s || s.includes("..") || s.includes("\0"))) {
    return null;
  }
  const resolved = path.resolve(path.join(ROOT, ...parts));
  const root = path.resolve(ROOT);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) return null;
  return resolved;
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(_request: NextRequest, context: Ctx) {
  const abs = resolveSafe((await context.params).path ?? []);
  if (!abs || !existsSync(abs)) {
    return new NextResponse("Not found", { status: 404 });
  }
  const st = statSync(abs);
  if (!st.isFile()) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = path.extname(abs).toLowerCase();
  const stream = Readable.toWeb(createReadStream(abs)) as unknown as ReadableStream;

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": MIME[ext] ?? "application/octet-stream",
      "Content-Length": String(st.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
