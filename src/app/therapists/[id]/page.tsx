import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { findTherapistProfileForPublicRoute } from "@/lib/therapist-public";
import { TherapistPublicPageView } from "@/components/therapist/TherapistPublicPageView";
import type { WaitlistProductModel } from "@/components/products/WaitlistProductCard";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; tag?: string; type?: string; audience?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const profile = await findTherapistProfileForPublicRoute(id);
  if (!profile) return { title: "מטפל לא נמצא" };
  return {
    title: `${profile.user.name} | מטפל/ת צמחי מרפא`,
    description: profile.bio.slice(0, 160),
    openGraph: { title: profile.user.name, description: profile.bio.slice(0, 200) },
  };
}

export default async function TherapistByIdPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const profile = await findTherapistProfileForPublicRoute(id);
  if (!profile) notFound();

  const [articles, products] = await Promise.all([
    prisma.herbalArticle.findMany({
      where: { therapistId: profile.user.id, published: true },
      orderBy: { createdAt: "desc" },
      take: 24,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImageUrl: true,
        tags: true,
        audience: true,
        therapistId: true,
      },
    }),
    prisma.product.findMany({
      where: { active: true, therapistId: profile.user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const productModels: WaitlistProductModel[] = products.map((p) => ({
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
    audience: p.audience,
  }));

  return (
    <TherapistPublicPageView
      profile={profile}
      articles={articles}
      products={productModels}
      searchParams={sp}
    />
  );
}
