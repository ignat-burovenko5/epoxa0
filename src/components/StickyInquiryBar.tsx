import ProductPurchaseCtas from "@/components/ProductPurchaseCtas";

type StickyInquiryBarProps = {
  productName: string;
  price: number;
};

export default function StickyInquiryBar({ productName, price }: StickyInquiryBarProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full z-50 border-t border-luxury-charcoal/10 bg-museum-light px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(0,0,0,0.08)]">
      <ProductPurchaseCtas productName={productName} price={price} variant="sticky" />
    </div>
  );
}
