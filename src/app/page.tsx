import { prisma } from "@/lib/prisma";
import { pickDemoImage } from "@/lib/demo-placeholders";
import { getHomeHeroCopy, getVisionSlides } from "@/lib/site-config";
import { therapistPublicHref } from "@/lib/therapist-public";
import { HomeTherapistsRandomGrid, type HomeTherapistCard } from "@/components/home/HomeTherapistsRandomGrid";
import { HomeVisionCarousel } from "@/components/home/HomeVisionCarousel";

export const dynamic = "force-dynamic";

function clip(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** תמונת פרופיל: https, העלאה מקומית, או placeholder */
function gridCardImageUrl(url: string | null | undefined, fallback: string): string {
  const u = url?.trim();
  if (!u) return fallback;
  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("https://")) return u;
  if (u.startsWith("http://")) return `https://${u.slice(7)}`;
  if (u.startsWith("/uploads/")) return u;
  return fallback;
}

const HOME_THERAPIST_LIMIT = 4;

export default async function HomePage() {
  const [therapists, visionSlides, homeHero] = await Promise.all([
    prisma.therapistProfile.findMany({
      where: {
        user: {
          OR: [{ role: "admin" }, { AND: [{ role: "therapist" }, { therapistVerification: "approved" }] }],
        },
      },
      include: { user: { select: { name: true, image: true } } },
      orderBy: { updatedAt: "desc" },
      take: HOME_THERAPIST_LIMIT,
    }),
    getVisionSlides(),
    getHomeHeroCopy(),
  ]);

  const therapistCards: HomeTherapistCard[] = therapists.map((p) => {
    const spec = [p.specialty1, p.specialty2, p.specialty3].map((s) => s.trim()).filter(Boolean).join(" · ");
    const roleLabel = p.publicTherapistTitle === "male" ? "מטפל בצמחי מרפא" : "מטפלת בצמחי מרפא";
    return {
      id: p.id,
      name: p.user.name,
      roleLabel,
      specialties: clip(spec, 180),
      href: therapistPublicHref(p.id),
      imageUrl: gridCardImageUrl(p.user.image, pickDemoImage(`t-${p.id}`, "therapists")),
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
