import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

const DEFAULT_TIMEOUT_MS = Number(process.env.BACKEND_TIMEOUT_MS ?? 8000);

function internalApiToken(): string {
  const token =
    process.env.INTERNAL_API_TOKEN?.trim() ||
    process.env.CMS_BLOG_SECRET?.trim();
  if (token) return token;
  if (process.env.NODE_ENV === "production") {
    throw new Error("INTERNAL_API_TOKEN or CMS_BLOG_SECRET must be set in production");
  }
  return "dev-only-internal-token-change-me";
}

export function backendUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_URL}${p}`;
}

type BackendFetchOptions = RequestInit & {
  /** Forward browser/CMS cookies from the current RSC request. */
  forwardCookies?: boolean;
  /** Attach shared secret for server-only backend routes (default: auto-detect). */
  useInternalToken?: boolean;
  timeoutMs?: number;
};

export async function backendFetch<T>(
  path: string,
  options: BackendFetchOptions = {},
): Promise<T> {
  const {
    forwardCookies = false,
    useInternalToken = path.includes("/internal/"),
    timeoutMs = DEFAULT_TIMEOUT_MS,
    ...init
  } = options;
  const headers = new Headers(init.headers);

  if (useInternalToken) {
    headers.set("X-Internal-Token", internalApiToken());
  }

  if (forwardCookies) {
    const jar = await cookies();
    const session = jar.get("blog_session");
    if (session) {
      headers.set("Cookie", `${session.name}=${session.value}`);
    }
  }

  const res = await fetch(backendUrl(path), {
    ...init,
    headers,
    cache: "no-store",
    signal: init.signal ?? AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Backend ${res.status} ${path}: ${text.slice(0, 200)}`);
  }

  return res.json() as Promise<T>;
}
