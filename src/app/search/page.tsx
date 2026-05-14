import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { therapistPublicHref } from "@/lib/therapist-public";

export const metadata = {
  title: "חיפוש",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  if (!query) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-2xl text-herbal-900">חיפוש באתר</h1>
        <p className="mt-2 text-slate-600">הזינו מילת חיפוש — לחצו על אייקון החיפוש בראש העמוד.</p>
      </div>
    );
  }

  const [therapists, products, articles] = await Promise.all([
    prisma.therapistProfile.findMany({
      where: {
        OR: [
          { user: { name: { contains: query } } },
          { bio: { contains: query } },
          { specialty1: { contains: query } },
          { specialty2: { contains: query } },
          { specialty3: { contains: query } },
        ],
      },
      take: 20,
      include: { user: { select: { name: true } } },
    }),
    prisma.product.findMany({
      where: {
        active: true,
        OR: [{ title: { contains: query } }, { description: { contains: query } }],
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    }),
    prisma.herbalArticle.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query } },
          { excerpt: { contains: query } },
          { category: { contains: query } },
        ],
      },
      take: 20,
      include: { therapist: { select: { name: true } } },
    }),
  ]);

  const empty = therapists.length === 0 && products.length === 0 && articles.length === 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl text-herbal-900">תוצאות חיפוש</h1>
      <p className="mt-2 text-slate-600">
        חיפוש עבור: <span className="font-semibold text-herbal-800">{query}</span>
      </p>

      {empty && <p className="mt-8 text-slate-600">לא נמצאו תוצאות. נסו מילה אחרת.</p>}

      {therapists.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg font-bold text-herbal-900">מטפלים</h2>
          <ul className="mt-3 space-y-2">
            {therapists.map((t) => (
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

      {products.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg font-bold text-herbal-900">קורסים וסדנאות</h2>
          <ul className="mt-3 space-y-2">
            {products.map((p) => (
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

      {articles.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg font-bold text-herbal-900">מאמרים — אינדקס צמחים</h2>
          <ul className="mt-3 space-y-2">
            {articles.map((a) => (
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
