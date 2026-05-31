import CollectionSidenav from "@/components/CollectionSidenav";
import PageContainer from "@/components/PageContainer";

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-museum-light min-h-screen text-luxury-charcoal">
      <PageContainer className="py-8 md:py-12">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 lg:gap-12">
          <CollectionSidenav />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </PageContainer>
    </div>
  );
}
