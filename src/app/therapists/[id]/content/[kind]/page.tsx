import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogStyleList } from "@/components/content/BlogStyleList";
import { contentVisibleForViewer } from "@/lib/content-audience";
import { getContentViewer } from "@/lib/content-viewer";
import { findTherapistProfileForPublicRoute, therapistPublicHref } from "@/lib/therapist-public";
import {
  articlesToBlogList,
  isPortfolioContentKind,
  portfolioKindMeta,
  productMatchesPortfolioKind,
  productsToBlogList,
} from "@/lib/therapist-portfolio-content";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string; kind: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id, kind } = await params;
  if (!isPortfolioContentKind(kind)) return { title: "תוכן" };
  const profile = await findTherapistProfileForPublicRoute(id);
  if (!profile) return { title: "מטפל לא נמצא" };
  const meta = portfolioKindMeta(kind);
  return {
    title: `${meta.title} — ${profile.user.name}`,
    description: meta.description,
  };
}

export default async function TherapistContentListPage({ params }: Props) {
  const { id, kind: kindParam } = await params;
  if (!isPortfolioContentKind(kindParam)) notFound();

  const profile = await findTherapistProfileForPublicRoute(id);
  if (!profile) notFound();

  const viewer = await getContentViewer();
  const meta = portfolioKindMeta(kindParam);
  const profileHref = therapistPublicHref(profile.id);

  let items;
  if (kindParam === "articles") {
    const rows = await prisma.herbalArticle.findMany({
      where: { therapistId: profile.user.id, published: true },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        category: true,
        coverImageUrl: true,
        audience: true,
        updatedAt: true,
      },
    });
    items = articlesToBlogList(rows.filter((r) => contentVisibleForViewer(r.audience, viewer)));
  } else {
    const rows = await prisma.product.findMany({
      where: { active: true, therapistId: profile.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        imageUrl: true,
        audience: true,
        createdAt: true,
      },
    });
    const filtered = rows.filter(
      (r) => contentVisibleForViewer(r.audience, viewer) && productMatchesPortfolioKind(r.type, kindParam),
    );
    items = productsToBlogList(filtered);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6" dir="rtl">
      <nav className="text-sm text-slate-600">
        <Link href={profileHref} className="font-medium text-herbal-700 hover:underline">
          {profile.user.name}
        </Link>
        <span className="mx-2 text-herbal-300">/</span>
        <span className="text-herbal-900">{meta.title}</span>
      </nav>

      <h1 className="mt-4 font-display text-3xl font-bold text-herbal-900 sm:text-4xl">{meta.title}</h1>
      <p className="mt-2 max-w-2xl text-slate-600">{meta.description}</p>

      <BlogStyleList items={items} emptyMessage={meta.empty} />

      <p className="mt-12 border-t border-herbal-100 pt-8 text-center">
        <Link href={profileHref} className="text-sm font-semibold text-herbal-700 hover:underline">
          ← חזרה לפרופיל המטפל/ת
        </Link>
      </p>
    </div>
  );
}
