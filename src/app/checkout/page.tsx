import Link from "next/link";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import CheckoutPageLayout from "@/components/checkout/CheckoutPageLayout";
import CheckoutSuccess from "@/components/checkout/CheckoutSuccess";
import OrderSummary from "@/components/checkout/OrderSummary";
import { orderFromSlug } from "@/lib/order";

type CheckoutPageProps = {
  searchParams: Promise<{ sent?: string; slug?: string }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { sent: sentParam, slug } = await searchParams;
  const sent = sentParam === "1";
  const order = orderFromSlug(slug ?? null);

  if (sent) {
    return (
      <main className="bg-museum-light text-luxury-charcoal min-h-screen -mt-[var(--site-header-offset)] pt-[var(--site-header-offset)]">
        <CheckoutSuccess />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="bg-museum-light text-luxury-charcoal min-h-screen -mt-[var(--site-header-offset)] pt-[var(--site-header-offset)]">
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <h1 className="font-serif text-3xl mb-3">Выберите предмет</h1>
          <p className="font-sans text-sm text-luxury-charcoal/60 mb-8">
            Оформление доступно со страницы товара — нажмите «Оформить» на
            карточке в каталоге.
          </p>
          <Link
            href="/collection"
            className="btn-buy-primary inline-flex min-h-12 px-8 items-center font-sans text-xs uppercase text-museum-light"
          >
            <span className="relative z-[1]">В каталог</span>
          </Link>
        </div>
      </main>
    );
  }

  const line = order.lines[0]!;
  const backHref = `/${line.slug}`;

  return (
    <CheckoutPageLayout
      title="Оформление"
      subtitle="Оставьте контакты — куратор свяжется с вами в WhatsApp и уточнит доставку и оплату."
      productHref={backHref}
      productTitle={line.title}
      sidebar={<OrderSummary order={order} compact />}
    >
      <CheckoutForm order={order} backHref={backHref} />
    </CheckoutPageLayout>
  );
}
