"use client";

import Link from "next/link";
import type { WaitlistProductModel } from "@/components/products/WaitlistProductCard";
import { publicProductHref } from "@/lib/product-href";
import { storedImageSrc } from "@/lib/stored-image-url";

function money(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(v);
}

export function DigitalProductCard({ product }: { product: WaitlistProductModel }) {
  const coverImage = storedImageSrc(product.imageUrl);
  const href = publicProductHref(product.id);

  return (
    <article className="flex max-w-full overflow-hidden rounded-xl border border-herbal-100 bg-white shadow-sm transition hover:border-herbal-200 hover:shadow-md">
      <Link href={href} className="h-[4.75rem] w-[4.75rem] shrink-0 bg-herbal-50 sm:h-20 sm:w-24">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-herbal-600">
            דיגיטלי
          </div>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1 p-2.5 sm:p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug text-herbal-900">
            <Link href={href} className="hover:underline">
              {product.title}
            </Link>
          </h3>
          <span className="shrink-0 text-sm font-semibold text-herbal-900">{money(product.price)}</span>
        </div>
        <Link
          href={href}
          className="inline-flex min-h-[36px] items-center text-xs font-semibold text-herbal-700 underline-offset-4 hover:underline"
        >
          לפרטים ולרכישה
        </Link>
      </div>
    </article>
  );
}
