import ProductGetContacts from "@/components/ProductGetContacts";

type StickyInquiryBarProps = {
  productName: string;
};

export default function StickyInquiryBar({ productName }: StickyInquiryBarProps) {
  return (
    <div className="lg:hidden sticky-inquiry-bar fixed bottom-0 left-0 w-full border-t border-luxury-charcoal/10 bg-museum-light px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(0,0,0,0.08)]">
      <ProductGetContacts productName={productName} variant="sticky" />
    </div>
  );
}
