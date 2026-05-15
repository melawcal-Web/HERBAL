import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { WaitlistProductCard, type WaitlistProductModel } from "@/components/products/WaitlistProductCard";
import { ContentSearchFilter } from "@/components/search/ContentSearchFilter";
import { filterProductRow, type ContentSearchParams } from "@/lib/content-search";
import type { ContentAudienceId } from "@/lib/content-audience";
import type { ContentFilterType } from "@/components/search/ContentSearchFilter";

export const metadata = {
  title: "קורסים וסדנאות",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string; tag?: string; type?: string; audience?: string }>;
};

export default async function MarketplacePage({ searchParams }: Props) {
  const sp = await searchParams;
  const filters: ContentSearchParams = {
    q: sp.q,
    tag: sp.tag,
    type: (sp.type as ContentFilterType) || "product",
    audience: (sp.audience as ContentAudienceId) || null,
  };
  if (filters.type === "all" || !sp.type) filters.type = "product";

  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  const models: WaitlistProductModel[] = products
    .filter((p) => filterProductRow(p, filters))
    .map((p) => ({
      id: p.id,
      type: p.type,
      title: p.title,
      description: p.description,
      imageUrl: p.imageUrl,
      price: p.price,
      memberPrice: p.memberPrice,
      minParticipants: p.minParticipants,
      currentRegistered: p.currentRegistered,
      isWaitlist: p.isWaitlist,
      metadata: p.metadata,
      tags: p.tags,
      audience: p.audience,
      therapistId: p.therapistId,
    }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-herbal-900">קורסים וסדנאות</h1>
      <p className="mt-2 text-slate-600">סדנאות, זום והשגחה — רשימת המתנה עד למינימום משתתפים.</p>

      <Suspense fallback={<div className="mt-6 h-28 animate-pulse rounded-2xl bg-herbal-50" />}>
        <ContentSearchFilter className="mt-6" basePath="/marketplace" />
      </Suspense>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {models.map((p) => (
          <WaitlistProductCard key={p.id} product={p} />
        ))}
      </div>
      {models.length === 0 && <p className="mt-6 text-slate-600">אין פריטים פעילים התואמים לסינון.</p>}
    </div>
  );
}
