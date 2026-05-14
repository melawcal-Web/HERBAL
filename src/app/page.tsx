import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { HomeExploreGrid, type ExploreGridItem } from "@/components/home/HomeExploreGrid";
import { HomeVisionCarousel, type VisionSlide } from "@/components/home/HomeVisionCarousel";
import type { ProductType } from "@prisma/client";

export const dynamic = "force-dynamic";

const UNSPLASH =
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=80";
const UNSPLASH2 =
  "https://images.unsplash.com/photo-1515378791036-0648a3c77a02?auto=format&fit=crop&w=1400&q=80";
const UNSPLASH3 =
  "https://images.unsplash.com/photo-1470058869958-2a77ade41c02?auto=format&fit=crop&w=1400&q=80";
const UNSPLASH4 =
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=80";

const VISION_SLIDES: VisionSlide[] = [
  {
    id: "v1",
    eyebrow: "המרכז למטפלים בצמחי מרפא",
    title: "בית דיגיטלי למקצוע הצמחים",
    body: "המרכז מחבר מטפלים, לקוחות וידע — מקום שבו אפשר ללמוד, לשתף, לנהל יומן קליני, ולגלות תוכן איכותי על צמחי מרפא.",
    imageUrl: UNSPLASH,
  },
  {
    id: "v2",
    eyebrow: "ערכים",
    title: "מקצועיות, שקיפות וקהילה",
    body: "אנחנו מאמינים בליווי מבוסס מדע ומסורת, בכבוד הדדי בין מטפלים ללקוחות, ובכלים שמקלים על העבודה היומיומית בקליניקה.",
    imageUrl: UNSPLASH2,
  },
  {
    id: "v3",
    eyebrow: "למטפלים",
    title: "כלי עבודה במקום אחד",
    body: "דפי נחיתה אישיים, EMR, תיעוד טיפולים, ומחשבון נוסחאות — כדי שתוכלו להתמקד במטופלים, לא בבירוקרטיה.",
    imageUrl: UNSPLASH3,
  },
  {
    id: "v4",
    eyebrow: "לקהילה רחבה",
    title: "שוק, מאמרים וצמיחה",
    body: "מרקט עם הרצאות, סדנאות ומוצרים, לצד אינדקס צמחים עם מאמרים מקוריים ממטפלים רשומים — הכל עם ממשק נקי ונוח לנייד.",
    imageUrl: UNSPLASH4,
  },
];

function productTypeHebrew(t: ProductType): string {
  switch (t) {
    case "zoom":
      return "זום";
    case "workshop":
      return "סדנה";
    case "supervision":
      return "השגחה";
    case "shelf_product":
      return "מוצר";
    default:
      return "מרקט";
  }
}

function moneyShort(n: unknown): string {
  const v = typeof n === "number" ? n : Number(n);
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(v);
}

function clip(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export default async function HomePage() {
  const session = await auth();

  const [therapists, products, articles] = await Promise.all([
    prisma.therapistProfile.findMany({
      include: { user: { select: { name: true, image: true } } },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.herbalArticle.findMany({
      where: { published: true },
      include: { therapist: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
  ]);

  const gridItems: ExploreGridItem[] = [];

  for (const p of therapists) {
    const spec = [p.specialty1, p.specialty2, p.specialty3].filter(Boolean).join(" · ");
    gridItems.push({
      id: `t-${p.id}`,
      category: "therapists",
      title: p.user.name,
      subtitle: clip(spec || p.bio, 120),
      href: `/t/${p.slug}`,
      imageUrl: p.user.image,
      badge: "מטפל",
    });
  }

  for (const p of products) {
    gridItems.push({
      id: `p-${p.id}`,
      category: "marketplace",
      title: p.title,
      subtitle: clip(`${productTypeHebrew(p.type)} · מ-${moneyShort(p.price)} — ${p.description}`, 140),
      href: "/marketplace",
      imageUrl: null,
      badge: "מרקט",
    });
  }

  for (const a of articles) {
    gridItems.push({
      id: `a-${a.id}`,
      category: "herbal",
      title: a.title,
      subtitle: clip(`${a.excerpt} · ${a.therapist.name}`, 140),
      href: `/herbal-index/${a.slug}`,
      imageUrl: null,
      badge: "צמחים",
    });
  }

  /** Order: therapists → marketplace → herbal (readable “catalog” flow) */
  const exploreItems = gridItems;

  return (
    <div className="mx-auto max-w-6xl px-0 pb-14 pt-6 sm:px-4 sm:pb-16 sm:pt-8 md:px-6">
      <HomeVisionCarousel slides={VISION_SLIDES} />

      <div className="mt-10 flex flex-col items-stretch gap-3 px-4 sm:mt-12 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4 md:px-0">
        <Link href="/therapists" className="link-pill inline-flex min-h-[48px] items-center justify-center text-center text-sm font-semibold">
          כל המטפלים
        </Link>
        <Link href="/marketplace" className="link-pill inline-flex min-h-[48px] items-center justify-center text-center text-sm font-semibold">
          מרקט — הרצאות, סדנאות ומוצרים
        </Link>
        <Link href="/herbal-index" className="link-pill inline-flex min-h-[48px] items-center justify-center text-center text-sm font-semibold">
          אינדקס צמחים
        </Link>
      </div>

      <div className="px-4 md:px-0">
        <HomeExploreGrid items={exploreItems} />
      </div>

      <section className="mx-4 mt-14 rounded-3xl border border-herbal-100/90 bg-white/80 p-8 text-center shadow-glass backdrop-blur-sm sm:mx-0 sm:mt-16 sm:p-10">
        <h2 className="font-display text-2xl font-bold text-gradient-herbal sm:text-3xl">התחלו עכשיו</h2>
        <p className="mx-auto mt-3 max-w-lg text-slate-600">
          {session?.user
            ? `שלום, ${session.user.name}. עברו לאזור האישי.`
            : "הירשמו כמטפל או כלקוח כדי לגשת לכלים המלאים."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {session?.user ? (
            <Link
              href="/dashboard"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full px-8 py-3 text-base font-semibold text-white btn-shimmer"
            >
              אזור אישי
            </Link>
          ) : (
            <Link
              href="/auth/register"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full px-10 py-3 text-base font-semibold text-white btn-shimmer"
            >
              הרשמה
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
