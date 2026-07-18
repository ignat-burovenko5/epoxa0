import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const INTERNAL_API_PATTERN =
  /^\/api\/(blog|analytics|shop)\/internal(?:\/|$)/;
const DEV_ONLY_PATTERN = /^\/(asdoifj1oi|api\/image-lab)(?:\/|$)/;

function applySecurityHeaders(response: NextResponse): NextResponse {
  if (process.env.NODE_ENV === "development") {
    return response;
  }

  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' blob: data: https://images.unsplash.com https://static-maps.yandex.ru https://*.maps.yandex.net",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-src 'self' https://yandex.ru https://yandex.com https://*.yandex.ru https://*.yandex.com https://api-maps.yandex.ru",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  return response;
}

export function proxy(request: NextRequest) {
  if (INTERNAL_API_PATTERN.test(request.nextUrl.pathname)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (
    process.env.NODE_ENV === "production" &&
    DEV_ONLY_PATTERN.test(request.nextUrl.pathname)
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
