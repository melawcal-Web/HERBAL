import { notFound, permanentRedirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { therapistPublicHref } from "@/lib/therapist-public";

type Props = { params: Promise<{ slug: string }> };

/** Legacy URL — redirects to canonical `/therapists/[id]`. */
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const profile = await prisma.therapistProfile.findFirst({
    where: {
      slug,
      user: {
        OR: [{ role: "admin" }, { AND: [{ role: "therapist" }, { therapistVerification: "approved" }] }],
      },
    },
    include: { user: { select: { name: true } } },
  });
  if (!profile) return { title: "מטפל לא נמצא" };
  return {
    title: `${profile.user.name} | מטפל/ת צמחי מרפא`,
    description: profile.bio.slice(0, 160),
    openGraph: { title: profile.user.name, description: profile.bio.slice(0, 200) },
  };
}

export default async function LegacyTherapistSlugRedirect({ params }: Props) {
  const { slug } = await params;
  const profile = await prisma.therapistProfile.findFirst({
    where: {
      slug,
      user: {
        OR: [{ role: "admin" }, { AND: [{ role: "therapist" }, { therapistVerification: "approved" }] }],
      },
    },
    select: { id: true },
  });
  if (!profile) notFound();
  permanentRedirect(therapistPublicHref(profile.id));
}
