import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await prisma.herbalArticle.findUnique({
    where: { slug, published: true },
    include: { therapist: { select: { name: true } } },
  });
  if (!article) return { title: "מאמר לא נמצא" };
  return { title: article.title, description: article.excerpt };
}

export default async function HerbalArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await prisma.herbalArticle.findUnique({
    where: { slug, published: true },
    include: {
      therapist: { select: { name: true, therapistProfile: { select: { slug: true } } } },
    },
  });
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-sm text-sage">
        {article.therapist.therapistProfile ? (
          <Link href={`/t/${article.therapist.therapistProfile.slug}`} className="underline">
            {article.therapist.name}
          </Link>
        ) : (
          article.therapist.name
        )}
      </p>
      <h1 className="mt-2 font-display text-3xl text-herbal-900">{article.title}</h1>
      <p className="mt-4 text-lg text-slate-700">{article.excerpt}</p>
      <div className="mt-10 max-w-none whitespace-pre-wrap text-slate-800 leading-relaxed">
        {article.body}
      </div>
      <div className="mt-10">
        <Link href="/herbal-index" className="text-herbal-700 underline">
          חזרה לאינדקס
        </Link>
      </div>
    </article>
  );
}
