import type { ReactNode } from "react";
import { requireDashboardAuth } from "@/app/blog/1209u1lkjea/dashboard/layout";

type LayoutProps = {
  children: ReactNode;
};

export default async function BlogCmsAuthLayout({ children }: LayoutProps) {
  await requireDashboardAuth();
  return children;
}
