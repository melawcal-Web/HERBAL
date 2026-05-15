import { prisma } from "@/lib/prisma";
import { contentKindLabel } from "@/lib/commerce";
import { productTypeToContentKind } from "@/lib/content-kind";

export type ContentHubItem = {
  id: string;
  title: string;
  kind: string;
  kindLabel: string;
  date: Date;
  therapistName: string;
  therapistProfileId: string | null;
  href: string;
};

export async function listContentHubItems(limit = 80): Promise<ContentHubItem[]> {
  const [articles, products] = await Promise.all([
    prisma.herbalArticle.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { therapist: { select: { name: true, therapistProfile: { select: { id: true } } } } },
    }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { therapist: { select: { name: true, therapistProfile: { select: { id: true } } } } },
    }),
  ]);

  const items: ContentHubItem[] = [];

  for (const a of articles) {
    const profileId = a.therapist.therapistProfile?.id ?? null;
    items.push({
      id: a.id,
      title: a.title,
      kind: "article",
      kindLabel: contentKindLabel("article"),
      date: a.createdAt,
      therapistName: a.therapist.name,
      therapistProfileId: profileId,
      href: `/herbal-index/${a.slug}`,
    });
  }

  for (const p of products) {
    const kind = productTypeToContentKind(p.type);
    const profileId = p.therapist?.therapistProfile?.id ?? null;
    items.push({
      id: p.id,
      title: p.title,
      kind,
      kindLabel: contentKindLabel(kind),
      date: p.createdAt,
      therapistName: p.therapist?.name ?? "המרכז",
      therapistProfileId: profileId,
      href: profileId ? `/therapists/${profileId}` : "/marketplace",
    });
  }

  items.sort((a, b) => b.date.getTime() - a.date.getTime());
  return items.slice(0, limit);
}
