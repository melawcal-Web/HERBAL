import {
  TherapistsShowcaseCarousel,
  type TherapistShowcaseItem,
} from "@/components/TherapistsShowcaseCarousel";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "מטפלים",
};

export default async function TherapistsDirectoryPage() {
  const therapists = await prisma.therapistProfile.findMany({
    include: { user: { select: { name: true, image: true } } },
    orderBy: { createdAt: "desc" },
  });

  const items: TherapistShowcaseItem[] = therapists.map((t) => ({
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
