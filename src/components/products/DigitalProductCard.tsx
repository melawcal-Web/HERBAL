"use client";

import type { WaitlistProductModel } from "@/components/products/WaitlistProductCard";
import { ProductPaymentHandoff } from "@/components/products/ProductPaymentHandoff";
import { productTypeToContentKind } from "@/lib/content-kind";
import { storedImageSrc } from "@/lib/stored-image-url";
import type { TherapistPaymentSettings } from "@/lib/therapist-payments";

function money(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(v);
}

export function DigitalProductCard({
  product,
  paymentSettings,
}: {
  product: WaitlistProductModel;
  paymentSettings: TherapistPaymentSettings;
}) {
  const coverImage = storedImageSrc(product.imageUrl);
  const amount = Number(product.price);

  return (
    <article className="flex max-w-full overflow-hidden rounded-xl border border-herbal-100 bg-white shadow-sm transition hover:border-herbal-200 hover:shadow-md">
      <div className="h-[4.75rem] w-[4.75rem] shrink-0 bg-herbal-50 sm:h-20 sm:w-24">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-herbal-600">
            דיגיטלי
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1 p-2.5 sm:p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug text-herbal-900">{product.title}</h3>
          <span className="shrink-0 text-sm font-semibold text-herbal-900">{money(product.price)}</span>
        </div>
        {product.therapistId ? (
          <ProductPaymentHandoff
            compact
            therapistId={product.therapistId}
            contentKind={productTypeToContentKind(product.type)}
            contentId={product.id}
            contentTitle={product.title}
            amountNis={amount}
            paymentSettings={paymentSettings}
          />
        ) : (
          <span className="text-[11px] font-semibold text-herbal-700">רכישה (בקרוב)</span>
        )}
      </div>
    </article>
  );
}
