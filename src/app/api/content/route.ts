import { getContentPage, CONTENT_PAGE_SIZE } from "@/lib/content";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");
  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0) || 0);
  const limit = Math.min(
    24,
    Math.max(1, Number(searchParams.get("limit") ?? CONTENT_PAGE_SIZE) || CONTENT_PAGE_SIZE),
  );

  if (!section) {
    return NextResponse.json({ error: "Missing section" }, { status: 400 });
  }

  const page = getContentPage(section, offset, limit);
  if (!page) {
    return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  }

  return NextResponse.json(page);
}
