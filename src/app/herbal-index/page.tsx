import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { therapistPublicHref } from "@/lib/therapist-public";

export const metadata = {
  title: "אינדקס צמחים",
};

export default async function HerbalIndexPage() {
  const articles = await prisma.herbalArticle.findMany({
    where: { published: true },
    include: {
      therapist: { select: { name: true, therapistProfile: { select: { slug: true, id: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-herbal-900">אינדקס צמחים</h1>
      <p className="mt-2 text-slate-600">מאמרים מקושרים למטפלים הרשומים במרכז.</p>
      <ul className="mt-8 space-y-4">
        {articles.map((a) => (
          <li key={a.id}>
            <article className="rounded-2xl border border-herbal-100 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-herbal-900">
                <Link href={`/herbal-index/${a.slug}`} className="hover:underline">
                  {a.title}
                </Link>
              </h2>
              {a.category ? (
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-herbal-700/90">{a.category}</p>
              ) : null}
              <p className="mt-2 text-slate-600">{a.excerpt}</p>
              <p className="mt-3 text-sm text-sage">
                מטפל/ת:{" "}
                {a.therapist.therapistProfile ? (
                  <Link className="underline" href={therapistPublicHref(a.therapist.therapistProfile.id)}>
                    {a.therapist.name}
                  </Link>
                ) : (
                  a.therapist.name
                )}
              </p>
            </article>
          </li>
        ))}
      </ul>
      {articles.length === 0 && (
        <p className="mt-6 text-slate-600">אין מאמרים פורסמים עדיין. חזרו בקרוב.</p>
      )}
    </div>
  );
}
