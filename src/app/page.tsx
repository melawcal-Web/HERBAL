import { prisma } from "@/lib/prisma";
import { pickDemoImage } from "@/lib/demo-placeholders";
import { getVisionSlides } from "@/lib/site-config";
import { HomeExploreGrid, type ExploreGridItem } from "@/components/home/HomeExploreGrid";
import { HomeVisionCarousel } from "@/components/home/HomeVisionCarousel";
import type { ProductType } from "@prisma/client";

export const dynamic = "force-dynamic";

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

/** רק כתובות https מלאות — נתיבים יחסיים / http / שבורות → נופלים ל-placeholder */
function gridCardImageUrl(url: string | null | undefined, fallback: string): string {
  const u = url?.trim();
  if (!u) return fallback;
  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("https://")) return u;
  if (u.startsWith("http://")) return `https://${u.slice(7)}`;
  return fallback;
}

export default async function HomePage() {
  const [therapists, products, articles, visionSlides] = await Promise.all([
    prisma.therapistProfile.findMany({
      include: { user: { select: { name: true, image: true } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.herbalArticle.findMany({
      where: { published: true },
      include: { therapist: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    getVisionSlides(),
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
      imageUrl: gridCardImageUrl(p.user.image, pickDemoImage(`t-${p.id}`, "therapists")),
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
      imageUrl: pickDemoImage(`p-${p.id}`, "marketplace"),
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
      imageUrl: pickDemoImage(`a-${a.id}`, "herbal"),
      badge: "צמחים",
    });
  }

  return (
    <div className="w-full max-w-full pb-14 pt-4 transition-opacity duration-300 ease-out sm:pb-16 sm:pt-6">
      <HomeVisionCarousel slides={visionSlides} />

      <div className="mt-8 sm:mt-10">
        <HomeExploreGrid items={gridItems} />
      </div>
    </div>
  );
}
