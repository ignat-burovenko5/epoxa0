import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getBlogSession } from "@/lib/blog/auth";
import { blogDashboardLoginPath } from "@/lib/blog/urls";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type LayoutProps = {
  children: ReactNode;
};

/** Protects `/blog/1209u1lkjea/dashboard/*` except login (handled in child layout). */
export default async function BlogDashboardRootLayout({ children }: LayoutProps) {
  return children;
}

export async function requireDashboardAuth() {
  const session = await getBlogSession();
  if (!session) {
    redirect(blogDashboardLoginPath());
  }
  return session;
}
