import CollectionSidenav from "@/components/CollectionSidenav";
import PageContainer from "@/components/PageContainer";

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-museum-light min-h-screen text-luxury-charcoal -mt-[var(--site-header-offset)] pt-[var(--site-header-offset)]">
      <PageContainer className="py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10 lg:gap-12">
          <CollectionSidenav />
          {/* Products scroll with the page; categories use their own pane scroll */}
          <div className="flex-1 min-w-0 overscroll-y-auto">{children}</div>
        </div>
      </PageContainer>
    </div>
  );
}
