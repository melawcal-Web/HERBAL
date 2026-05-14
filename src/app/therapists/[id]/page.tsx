import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { findTherapistProfileForPublicRoute } from "@/lib/therapist-public";
import { TherapistPublicPageView } from "@/components/therapist/TherapistPublicPageView";

type Props = { params: Promise<{ id: string }> };

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

export default async function TherapistByIdPage({ params }: Props) {
  const { id } = await params;
  const profile = await findTherapistProfileForPublicRoute(id);
  if (!profile) notFound();

  const articles = await prisma.herbalArticle.findMany({
    where: { therapistId: profile.user.id, published: true },
    orderBy: { createdAt: "desc" },
    take: 24,
    select: { id: true, title: true, slug: true, excerpt: true, coverImageUrl: true },
  });

  return <TherapistPublicPageView profile={profile} articles={articles} />;
}
