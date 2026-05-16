import { prisma } from "@/lib/prisma";
import { pickDemoImage, pickDistinctDemoImage } from "@/lib/demo-placeholders";
import { getHomeHeroCopy, getVisionSlides } from "@/lib/site-config";
import { therapistPublicHref } from "@/lib/therapist-public";
import { HomeTherapistsRandomGrid, type HomeTherapistCard } from "@/components/home/HomeTherapistsRandomGrid";
import { HomeVisionCarousel } from "@/components/home/HomeVisionCarousel";
import { shuffleArray } from "@/lib/shuffle-array";

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

function hasStoredProfileImage(url: string | null | undefined): boolean {
  const u = url?.trim();
  if (!u) return false;
  if (u.startsWith("//")) return true;
  if (u.startsWith("https://")) return true;
  if (u.startsWith("http://")) return true;
  if (u.startsWith("/uploads/")) return true;
  return false;
}

const HOME_THERAPIST_LIMIT = 4;
const HOME_THERAPIST_FETCH_POOL = 48;

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
      take: HOME_THERAPIST_FETCH_POOL,
    }),
    getVisionSlides(),
    getHomeHeroCopy(),
  ]);

  const sortedPool = [...therapists].sort((a, b) => {
    const pa = hasStoredProfileImage(a.user.image) ? 1 : 0;
    const pb = hasStoredProfileImage(b.user.image) ? 1 : 0;
    if (pa !== pb) return pb - pa;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  /** בכל רענון — 4 מטפלים אקראיים מתוך המאגר (אחרי ערבוב). */
  const randomizedPick = shuffleArray(sortedPool).slice(0, HOME_THERAPIST_LIMIT);

  /** מונע שני כרטיסים עם אותה תמונה (אותו URL בפרופיל או התנגשות ב־hash). */
  const usedHomeTherapistImageUrls = new Set<string>();

  const therapistCards: HomeTherapistCard[] = randomizedPick.map((p) => {
    const spec = [p.specialty1, p.specialty2, p.specialty3].map((s) => s.trim()).filter(Boolean).join(" · ");
    const roleLabel = p.publicTherapistTitle === "male" ? "מטפל בצמחי מרפא" : "מטפלת בצמחי מרפא";
    let primary = gridCardImageUrl(p.user.image, pickDemoImage(`t-${p.id}`, "therapists"));
    let tries = 0;
    while (usedHomeTherapistImageUrls.has(primary) && tries < 64) {
      primary = pickDemoImage(`home-uniq-${p.id}-${tries}`, "therapists");
      tries += 1;
    }
    usedHomeTherapistImageUrls.add(primary);

    let backupImageUrl = pickDistinctDemoImage(p.id, "therapists", primary);
    let triesB = 0;
    while (backupImageUrl === primary && triesB < 32) {
      backupImageUrl = pickDemoImage(`home-bak-${p.id}-${triesB}`, "therapists");
      triesB += 1;
    }

    return {
      id: p.id,
      name: p.user.name,
      roleLabel,
      specialties: clip(spec, 180),
      href: therapistPublicHref(p.id),
      imageUrl: primary,
      backupImageUrl,
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
