import type { ReactNode } from "react";
import PageContainer from "@/components/PageContainer";

type BlogCmsShellProps = {
  children: ReactNode;
  /** Products catalog uses a wider canvas. */
  size?: "default" | "wide";
};

export default function BlogCmsShell({
  children,
  size = "default",
}: BlogCmsShellProps) {
  const widthClass =
    size === "wide"
      ? "py-6 md:py-8 max-w-[100rem] w-full px-4 sm:px-6 lg:px-8"
      : "py-8 md:py-12 max-w-5xl";

  return (
    <main className="bg-luxury-charcoal text-museum-light min-h-[50vh]">
      <PageContainer className={widthClass}>{children}</PageContainer>
    </main>
  );
}
