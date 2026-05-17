import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { pickDemoImage, pickDistinctDemoImage } from "@/lib/demo-placeholders";
import { getHomeHeroCopy, getVisionSlides } from "@/lib/site-config";
import { therapistPublicHref } from "@/lib/therapist-public";
import { HomeTherapistsRandomGrid, type HomeTherapistCard } from "@/components/home/HomeTherapistsRandomGrid";
import { HomeVisionCarousel } from "@/components/home/HomeVisionCarousel";
import { shuffleArray } from "@/lib/shuffle-array";
import { isStoredImageUrl } from "@/lib/stored-image-url";
import { auth } from "@/auth";

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
  return isStoredImageUrl(url);
}

const HOME_THERAPIST_LIMIT = 4;
const HOME_THERAPIST_FETCH_POOL = 48;

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);
  const isTherapist = session?.user?.role === "therapist";

  const homeHero = await getHomeHeroCopy();
  const visionSlides = isTherapist ? await getVisionSlides() : [];

  const therapists = isLoggedIn
    ? await prisma.therapistProfile.findMany({
        where: {
          user: {
            OR: [{ role: "admin" }, { AND: [{ role: "therapist" }, { therapistVerification: "approved" }] }],
          },
        },
        include: { user: { select: { name: true, image: true } } },
        orderBy: { updatedAt: "desc" },
        take: HOME_THERAPIST_FETCH_POOL,
      })
    : [];

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
      <HomeVisionCarousel slides={visionSlides} heroCopy={homeHero} showSlides={isTherapist} />

      <div className="mt-6 sm:mt-8">
        {isLoggedIn ? (
          <HomeTherapistsRandomGrid therapists={therapistCards} />
        ) : (
          <section
            className="mx-auto max-w-xl rounded-2xl border border-herbal-100 bg-white/90 p-6 text-center shadow-sm sm:p-8"
            aria-labelledby="guest-home-explore-title"
          >
            <h2 id="guest-home-explore-title" className="font-display text-lg font-bold text-herbal-900 sm:text-xl">
              רשימת המטפלים זמינה למשתמשים רשומים
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              התחברו או הירשמו כדי לצפות בפרטי מטפלים ובתוכן המלא. מאמרי האינדקס פתוחים לכולם.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row-reverse">
              <Link
                href="/auth/register?callbackUrl=%2F"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-herbal-600 px-5 text-sm font-semibold text-white transition hover:bg-herbal-500"
              >
                הרשמה
              </Link>
              <Link
                href="/auth/signin?callbackUrl=%2F"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-herbal-200 bg-white px-5 text-sm font-semibold text-herbal-900 transition hover:bg-herbal-50"
              >
                כניסה
              </Link>
            </div>
            <p className="mt-6 text-sm">
              <Link href="/herbal-index" className="font-semibold text-herbal-700 underline-offset-2 hover:underline">
                לאינדקס המאמרים (ללא התחברות)
              </Link>
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
