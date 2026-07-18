import { createReadStream, existsSync, statSync } from "fs";
import path from "path";
import { Readable } from "stream";
import { NextResponse } from "next/server";

const MIME: Record<string, string> = {
  ".avif": "image/avif",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
};

function resolveUnder(root: string, parts: string[]): string | null {
  if (!parts.length || parts.some((s) => !s || s.includes("..") || s.includes("\0"))) {
    return null;
  }
  const resolved = path.resolve(path.join(root, ...parts));
  const base = path.resolve(root);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) return null;
  return resolved;
}

/** Find a file under the first matching root; stream it with long cache. */
export function serveMediaFile(roots: string[], parts: string[]): NextResponse {
  for (const root of roots) {
    const abs = resolveUnder(root, parts);
    if (!abs || !existsSync(abs)) continue;
    const st = statSync(abs);
    if (!st.isFile()) continue;

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
  return new NextResponse("Not found", { status: 404 });
}
