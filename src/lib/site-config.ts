import { prisma } from "@/lib/prisma";
import {
  DEFAULT_HOME_HERO_HEADLINE,
  DEFAULT_HOME_HERO_MAIN_TITLE,
  DEFAULT_HOME_HERO_SLIDER_HINT,
  DEFAULT_SITE_TITLE,
  parseVisionSlides,
  type HomeHeroCopy,
  type VisionSlide,
} from "@/lib/home-vision";

export type HeroSlide = { imageUrl: string; caption: string };
export type { VisionSlide, HomeHeroCopy } from "@/lib/home-vision";

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    imageUrl:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1600&q=80",
    caption: "קהילת מטפלים בצמחי מרפא — לומדים, משתפים, ומתפתחים יחד.",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1515378791036-0648a3c77a02?auto=format&fit=crop&w=1600&q=80",
    caption: "יומן קליני, קורסים וסדנאות וכלים דיגיטליים במקום אחד.",
  },
];

function parseSlides(raw: unknown): HeroSlide[] {
  if (!Array.isArray(raw)) return FALLBACK_SLIDES;
  const out: HeroSlide[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const imageUrl = typeof o.imageUrl === "string" ? o.imageUrl.trim() : "";
    const caption = typeof o.caption === "string" ? o.caption.trim() : "";
    if (imageUrl.startsWith("https://") && caption) {
      out.push({ imageUrl, caption });
    }
  }
  return out.length ? out : FALLBACK_SLIDES;
}

export async function getSiteHeroSlides(): Promise<HeroSlide[]> {
  try {
    const row = await prisma.siteConfig.findUnique({ where: { id: "default" } });
    if (!row) return FALLBACK_SLIDES;
    return parseSlides(row.heroSlides);
  } catch {
    return FALLBACK_SLIDES;
  }
}

export async function getSiteServiceLabels() {
  try {
    const row = await prisma.siteConfig.findUnique({ where: { id: "default" } });
    return {
      github: row?.githubUsername ?? "",
      vercel: row?.vercelUsername ?? "",
      railway: row?.railwayUsername ?? "",
    };
  } catch {
    return { github: "", vercel: "", railway: "" };
  }
}

export async function getSiteTitle(): Promise<string> {
  try {
    const row = await prisma.siteConfig.findUnique({ where: { id: "default" } });
    const t = row?.siteTitle?.trim();
    return t?.length ? t : DEFAULT_SITE_TITLE;
  } catch {
    return DEFAULT_SITE_TITLE;
  }
}

export async function getVisionSlides(): Promise<VisionSlide[]> {
  try {
    const row = await prisma.siteConfig.findUnique({ where: { id: "default" } });
    return parseVisionSlides(row?.visionSlides ?? null);
  } catch {
    return parseVisionSlides(null);
  }
}

export async function getHomeHeroCopy(): Promise<HomeHeroCopy> {
  try {
    const row = await prisma.siteConfig.findUnique({ where: { id: "default" } });
    const mainTitle = row?.homeHeroMainTitle?.trim();
    const headline = row?.homeHeroHeadline?.trim();
    const sliderHint = row?.homeHeroSliderHint?.trim();
    return {
      mainTitle: mainTitle?.length ? mainTitle : DEFAULT_HOME_HERO_MAIN_TITLE,
      headline: headline?.length ? headline : DEFAULT_HOME_HERO_HEADLINE,
      sliderHint: sliderHint?.length ? sliderHint : DEFAULT_HOME_HERO_SLIDER_HINT,
    };
  } catch {
    return {
      mainTitle: DEFAULT_HOME_HERO_MAIN_TITLE,
      headline: DEFAULT_HOME_HERO_HEADLINE,
      sliderHint: DEFAULT_HOME_HERO_SLIDER_HINT,
    };
  }
}
