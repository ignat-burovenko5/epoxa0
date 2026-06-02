import type { ReactNode } from "react";
import PageContainer from "@/components/PageContainer";

type BlogCmsShellProps = {
  children: ReactNode;
};

export default function BlogCmsShell({ children }: BlogCmsShellProps) {
  return (
    <main className="bg-luxury-charcoal text-museum-light min-h-[50vh]">
      <PageContainer className="py-8 md:py-12 max-w-5xl">{children}</PageContainer>
    </main>
  );
}
