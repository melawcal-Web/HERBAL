import { prisma } from "@/lib/prisma";
import { getHomeHeroCopy, getVisionSlides } from "@/lib/site-config";
import { therapistPublicHref } from "@/lib/therapist-public";
import { therapistAvatarSrc } from "@/lib/therapist-avatar";
import { HomeTherapistsRandomGrid, type HomeTherapistCard } from "@/components/home/HomeTherapistsRandomGrid";
import { HomeVisionCarousel } from "@/components/home/HomeVisionCarousel";
import { shuffleArray } from "@/lib/shuffle-array";
import { isStoredImageUrl } from "@/lib/stored-image-url";

export const dynamic = "force-dynamic";

function clip(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function hasStoredProfileImage(url: string | null | undefined): boolean {
  return isStoredImageUrl(url);
}

const HOME_THERAPIST_LIMIT = 4;
const HOME_THERAPIST_FETCH_POOL = 48;

export default async function HomePage() {
  const homeHero = await getHomeHeroCopy();
  const visionSlides = await getVisionSlides();

  const therapists = await prisma.therapistProfile.findMany({
    where: {
      user: {
        OR: [{ role: "admin" }, { AND: [{ role: "therapist" }, { therapistVerification: "approved" }] }],
      },
    },
    include: { user: { select: { name: true, image: true } } },
    orderBy: { updatedAt: "desc" },
    take: HOME_THERAPIST_FETCH_POOL,
  });

  const sortedPool = [...therapists].sort((a, b) => {
    const pa = hasStoredProfileImage(a.user.image) ? 1 : 0;
    const pb = hasStoredProfileImage(b.user.image) ? 1 : 0;
    if (pa !== pb) return pb - pa;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  /** בכל רענון — 4 מטפלים אקראיים מתוך המאגר (אחרי ערבוב). */
  const randomizedPick = shuffleArray(sortedPool).slice(0, HOME_THERAPIST_LIMIT);

  const therapistCards: HomeTherapistCard[] = randomizedPick.map((p) => {
    const spec = [p.specialty1, p.specialty2, p.specialty3].map((s) => s.trim()).filter(Boolean).join(" · ");
    const roleLabel = p.publicTherapistTitle === "male" ? "מטפל בצמחי מרפא" : "מטפלת בצמחי מרפא";
    return {
      id: p.id,
      name: p.user.name,
      roleLabel,
      specialties: clip(spec, 180),
      href: therapistPublicHref(p.id),
      imageUrl: therapistAvatarSrc(p.user.image, p.id),
    };
  });

  return (
    <div className="w-full max-w-full pb-14 pt-4 transition-opacity duration-300 ease-out sm:pb-16 sm:pt-6">
      <HomeVisionCarousel slides={visionSlides} heroCopy={homeHero} />

      <div className="mt-6 sm:mt-8">
        <HomeTherapistsRandomGrid therapists={therapistCards} />
      </div>
    </div>
  );
}
