import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const BLOG_SESSION_COOKIE = "blog_session";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

export type BlogSession = {
  user: string;
  exp: number;
};

function sessionSecret(): string {
  const secret = process.env.CMS_BLOG_SECRET;
  if (!secret || secret.length < 16) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CMS_BLOG_SECRET must be set (min 16 chars) in production");
    }
    return "dev-only-blog-secret-change-me";
  }
  return secret;
}

function blogCredentials(): { user: string; password: string } {
  const user = process.env.CMS_BLOG_USER ?? "admin";
  const password = process.env.CMS_BLOG_PASSWORD ?? "changeme";
  return { user, password };
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

function encodeSession(session: BlogSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decodeSession(token: string): BlogSession | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as BlogSession;
    if (!session.user || typeof session.exp !== "number") return null;
    if (session.exp < Date.now() / 1000) return null;
    return session;
  } catch {
    return null;
  }
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function verifyBlogPassword(username: string, password: string): boolean {
  const creds = blogCredentials();
  return safeEqual(username, creds.user) && safeEqual(password, creds.password);
}

export function createBlogSessionToken(username: string): string {
  const session: BlogSession = {
    user: username,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC,
  };
  return encodeSession(session);
}

export function getSessionFromToken(token: string | undefined): BlogSession | null {
  if (!token) return null;
  return decodeSession(token);
}

export async function getBlogSession(): Promise<BlogSession | null> {
  const { backendFetch } = await import("@/lib/backend/client");
  try {
    const data = await backendFetch<{
      authenticated: boolean;
      user?: string;
      exp?: number;
    }>("/api/blog/auth/session", { forwardCookies: true });
    if (!data.authenticated || !data.user || typeof data.exp !== "number") {
      return null;
    }
    return { user: data.user, exp: data.exp };
  } catch {
    const jar = await cookies();
    const token = jar.get(BLOG_SESSION_COOKIE)?.value;
    return getSessionFromToken(token);
  }
}

export function getSessionFromRequest(request: NextRequest): BlogSession | null {
  return getSessionFromToken(request.cookies.get(BLOG_SESSION_COOKIE)?.value);
}

function cookieSecure(request?: Request): boolean {
  if (process.env.CMS_COOKIE_SECURE === "true") return true;
  if (process.env.CMS_COOKIE_SECURE === "false") return false;
  if (request) {
    try {
      return new URL(request.url).protocol === "https:";
    } catch {
      return false;
    }
  }
  return false;
}

export function sessionCookieOptions(token: string, request?: Request) {
  return {
    name: BLOG_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: cookieSecure(request),
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}

export function clearSessionCookieOptions(request?: Request) {
  return {
    name: BLOG_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: cookieSecure(request),
    path: "/",
    maxAge: 0,
  };
}

export function csrfToken(): string {
  return randomBytes(24).toString("base64url");
}
