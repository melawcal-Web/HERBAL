import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { therapistPublicHref } from "@/lib/therapist-public";
import { ContentSearchFilter } from "@/components/search/ContentSearchFilter";
import {
  filterArticleRow,
  filterProductRow,
  filterTherapistRow,
  type ContentSearchParams,
} from "@/lib/content-search";
import { contentVisibleForViewer } from "@/lib/content-audience";
import { getContentViewer } from "@/lib/content-viewer";
import type { ContentFilterType } from "@/components/search/ContentSearchFilter";
import { auth } from "@/auth";
import { MemberAuthWall } from "@/components/auth/MemberAuthWall";
import { memberCallbackPathFromSearch } from "@/lib/member-callback-path";

export const metadata = {
  title: "חיפוש",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string; tag?: string; type?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const session = await auth();
  const sp = await searchParams;
  if (!session?.user) {
    return <MemberAuthWall callbackPath={memberCallbackPathFromSearch("/search", sp, ["q", "tag", "type"])} />;
  }

  const viewer = await getContentViewer();
  const filters: ContentSearchParams = {
    q: sp.q,
    tag: sp.tag,
    type: (sp.type as ContentFilterType) || "all",
  };

  const hasFilter = Boolean(sp.q?.trim() || sp.tag?.trim() || sp.type);

  const [therapists, products, articles] = await Promise.all([
    prisma.therapistProfile.findMany({
      where: {
        user: {
          OR: [{ role: "admin" }, { AND: [{ role: "therapist" }, { therapistVerification: "approved" }] }],
        },
      },
      take: 50,
      include: { user: { select: { name: true } } },
    }),
    prisma.product.findMany({
      where: { active: true },
      take: 50,
      orderBy: { createdAt: "desc" },
    }),
    prisma.herbalArticle.findMany({
      where: { published: true },
      take: 50,
      include: { therapist: { select: { name: true } } },
    }),
  ]);

  const therapistRows = therapists.filter((t) => filterTherapistRow(t, filters));
  const productRows = products
    .filter((p) => contentVisibleForViewer(p.audience, viewer))
    .filter((p) => filterProductRow(p, filters));
  const articleRows = articles
    .filter((a) => contentVisibleForViewer(a.audience, viewer))
    .filter((a) => filterArticleRow(a, filters));

  const empty = !hasFilter || (therapistRows.length === 0 && productRows.length === 0 && articleRows.length === 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl text-herbal-900">חיפוש באתר</h1>
      <p className="mt-2 text-slate-600">סינון לפי תגית וסוג תוכן — בכל האתר. קורסים ומאמרים מוצגים לפי פרופיל המשתמש/ת המחובר/ת.</p>

      <Suspense fallback={<div className="mt-6 h-28 animate-pulse rounded-2xl bg-herbal-50" />}>
        <ContentSearchFilter className="mt-6" />
      </Suspense>

      {!hasFilter ? (
        <p className="mt-8 text-slate-600">בחרו מסננים או הקלידו מילת חיפוש.</p>
      ) : null}

      {hasFilter && empty ? <p className="mt-8 text-slate-600">לא נמצאו תוצאות. נסו מילה אחרת.</p> : null}

      {therapistRows.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg font-bold text-herbal-900">מטפלים</h2>
          <ul className="mt-3 space-y-2">
            {therapistRows.map((t) => (
              <li key={t.id}>
                <Link
                  href={therapistPublicHref(t.id)}
                  className="block rounded-xl border border-herbal-100 bg-white px-4 py-3 text-herbal-900 shadow-sm transition hover:border-herbal-300"
                >
                  <span className="font-semibold">{t.user.name}</span>
                  <span className="mt-1 block line-clamp-2 text-sm text-slate-600">{t.bio}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {productRows.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg font-bold text-herbal-900">קורסים וסדנאות</h2>
          <ul className="mt-3 space-y-2">
            {productRows.map((p) => (
              <li key={p.id}>
                <Link
                  href="/marketplace"
                  className="block rounded-xl border border-herbal-100 bg-white px-4 py-3 text-herbal-900 shadow-sm transition hover:border-herbal-300"
                >
                  <span className="font-semibold">{p.title}</span>
                  <span className="mt-1 block line-clamp-2 text-sm text-slate-600">{p.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {articleRows.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg font-bold text-herbal-900">מאמרים — אינדקס צמחים</h2>
          <ul className="mt-3 space-y-2">
            {articleRows.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/herbal-index/${a.slug}`}
                  className="block rounded-xl border border-herbal-100 bg-white px-4 py-3 text-herbal-900 shadow-sm transition hover:border-herbal-300"
                >
                  <span className="font-semibold">{a.title}</span>
                  <span className="mt-1 block text-xs text-slate-500">{a.therapist.name}</span>
                  <span className="mt-1 block line-clamp-2 text-sm text-slate-600">{a.excerpt}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
