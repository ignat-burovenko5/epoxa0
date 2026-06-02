import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/blog/auth";

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function requireBlogSession(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) return null;
  return session;
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
