import {
  TherapistsShowcaseCarousel,
  type TherapistShowcaseItem,
} from "@/components/TherapistsShowcaseCarousel";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { MemberAuthWall } from "@/components/auth/MemberAuthWall";

export const metadata = {
  title: "מטפלים",
};

export default async function TherapistsDirectoryPage() {
  const session = await auth();
  if (!session?.user) return <MemberAuthWall callbackPath="/therapists" />;

  const therapists = await prisma.therapistProfile.findMany({
    where: {
      user: {
        OR: [{ role: "admin" }, { AND: [{ role: "therapist" }, { therapistVerification: "approved" }] }],
      },
    },
    include: { user: { select: { name: true, image: true } } },
    orderBy: { createdAt: "desc" },
  });

  const items: TherapistShowcaseItem[] = therapists.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.user.name ?? "מטפל/ת",
    image: t.user.image,
    specialty1: t.specialty1,
    specialty2: t.specialty2,
    specialty3: t.specialty3,
  }));

  return (
    <div className="relative w-full overflow-x-hidden">
      <TherapistsShowcaseCarousel items={items} />
    </div>
  );
}
