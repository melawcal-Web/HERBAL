import { notFound } from "next/navigation";
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

  return <TherapistPublicPageView profile={profile} />;
}
