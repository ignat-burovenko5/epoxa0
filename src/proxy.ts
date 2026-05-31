import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(_request: NextRequest) {
  // HTML only — never run CSP on /_next/static (CSS, JS, fonts)
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    style-src-attr 'unsafe-inline';
    img-src 'self' blob: data: https://images.unsplash.com;
    font-src 'self';
    connect-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next|api|favicon.ico|.*\\..*).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
