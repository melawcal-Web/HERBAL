"use client";

import { useState, useTransition } from "react";
import type { ProductType } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { joinProductWaitlist } from "@/app/actions/waitlist";
import { audienceLabels } from "@/lib/content-audience";
import { parseProductMetadata, parseProductAudience } from "@/lib/product-metadata";
import { productTypeToContentKind } from "@/lib/content-kind";
import { storedImageSrc } from "@/lib/stored-image-url";
import { ManualAccessRequestButton } from "@/components/products/ManualAccessRequestButton";
import { ChaptersAccordion } from "@/components/content/ChaptersAccordion";
import { chaptersFromProductMeta } from "@/lib/content-description-chapters";
import type { PriceCategory } from "@prisma/client";

export type WaitlistProductModel = {
  id: string;
  type: ProductType;
  title: string;
  description: string;
  imageUrl: string | null;
  price: unknown;
  memberPrice: unknown;
  minParticipants: number;
  currentRegistered: number;
  isWaitlist: boolean;
  metadata: Prisma.JsonValue | null;
  tags: Prisma.JsonValue | null;
  audience: Prisma.JsonValue | null;
  therapistId?: string | null;
};

function money(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(v);
}

export function WaitlistProductCard({ product }: { product: WaitlistProductModel }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const meta = parseProductMetadata(product.metadata);
  const chapters = chaptersFromProductMeta(product.metadata, product.description, meta.courseDetails);
  const aud = audienceLabels(parseProductAudience(product.audience));
  const min = Math.max(1, product.minParticipants);
  const cur = product.currentRegistered;
  const remaining = Math.max(0, min - cur);
  const pct = Math.min(100, Math.round((cur / min) * 100));

  const when = meta.startsAt
    ? new Date(meta.startsAt).toLocaleString("he-IL", { dateStyle: "medium", timeStyle: "short" })
    : null;

  const coverImage = storedImageSrc(product.imageUrl);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-herbal-100 bg-white shadow-sm transition hover:border-herbal-200 hover:shadow-md">
      {coverImage ? (
        <div className="aspect-[16/10] w-full bg-herbal-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverImage} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="aspect-[16/10] w-full bg-gradient-to-br from-herbal-50 to-herbal-100" />
      )}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold text-herbal-900">{product.title}</h3>
        {aud ? <p className="mt-1 text-xs text-slate-500">קהל: {aud}</p> : null}
        <ChaptersAccordion chapters={chapters} className="mt-3" />
        {when ? <p className="mt-2 text-xs text-slate-500">מועד: {when}</p> : null}
        {meta.location ? <p className="text-xs text-slate-500">מיקום: {meta.location}</p> : null}

        {product.isWaitlist ? (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-herbal-100">
              <div className="h-full rounded-full bg-herbal-600 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-sm font-medium text-herbal-800">
              {remaining > 0
                ? `עוד ${remaining} נרשמים והסדנה יוצאת לדרך! (${cur}/${min})`
                : "הגענו למינימום — בקרוב עדכון על מועד!"}
            </p>
          </div>
        ) : null}

        <div className="mt-4 flex items-end justify-between gap-2 border-t border-herbal-50 pt-3">
          <span className="text-sm font-semibold text-herbal-900">{money(product.price)}</span>
          <span className="text-xs text-slate-500">חברים: {money(product.memberPrice)}</span>
        </div>

        {product.isWaitlist ? (
          <form
            className="mt-4 space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              setErr(null);
              setMsg(null);
              const fd = new FormData(e.currentTarget);
              startTransition(async () => {
                try {
                  await joinProductWaitlist({
                    productId: product.id,
                    guestName: String(fd.get("name") ?? ""),
                    guestEmail: String(fd.get("email") ?? ""),
                  });
                  setMsg("נרשמתם לרשימת ההמתנה — ניצור קשר כשיתמלא המינימום.");
                  e.currentTarget.reset();
                } catch (ex) {
                  setErr(ex instanceof Error ? ex.message : "שגיאה");
                }
              });
            }}
          >
            <input
              name="name"
              required
              placeholder="שם מלא"
              className="w-full rounded-lg border border-herbal-200 px-3 py-2 text-sm"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="אימייל"
              className="w-full rounded-lg border border-herbal-200 px-3 py-2 text-sm"
              dir="ltr"
            />
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-herbal-600 py-2.5 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-60"
            >
              {pending ? "שולח…" : "הצטרפות לרשימת המתנה"}
            </button>
          </form>
        ) : product.therapistId ? (
          <ManualAccessRequestButton
            therapistId={product.therapistId}
            contentKind={productTypeToContentKind(product.type)}
            contentId={product.id}
            contentTitle={product.title}
            priceCategory={"regular" as PriceCategory}
            amountNis={Number(product.price)}
          />
        ) : (
          <button
            type="button"
            className="mt-4 w-full rounded-full border border-herbal-300 py-2.5 text-sm font-semibold text-herbal-800"
          >
            רכישה (בקרוב)
          </button>
        )}
        {msg ? <p className="mt-2 text-xs text-herbal-700">{msg}</p> : null}
        {err ? <p className="mt-2 text-xs text-rose-600">{err}</p> : null}
      </div>
    </article>
  );
}
