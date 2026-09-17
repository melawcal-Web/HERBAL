import type { ProductType } from "@prisma/client";
import type { BlogStyleListItem } from "@/components/content/BlogStyleList";
import { productTypeLabel } from "@/lib/product-metadata";
import { herbalArticleHref } from "@/lib/herbal-index-flag";
import { therapistPublicHref } from "@/lib/therapist-public";
import { publicProductHref } from "@/lib/product-href";

export const PORTFOLIO_KINDS = ["articles", "courses", "recipes", "lectures"] as const;
export type PortfolioContentKind = (typeof PORTFOLIO_KINDS)[number];

export function isPortfolioContentKind(value: string): value is PortfolioContentKind {
  return (PORTFOLIO_KINDS as readonly string[]).includes(value);
}

export function portfolioKindMeta(kind: PortfolioContentKind): { title: string; description: string; empty: string } {
  switch (kind) {
    case "articles":
      return {
        title: "מאמרים",
        description: "מאמרים שפורסמו על ידי המטפל/ת",
        empty: "אין מאמרים מפורסמים בקטגוריה זו.",
      };
    case "courses":
      return {
        title: "קורסים וסדנאות",
        description: "קורסים, סדנאות ומפגשי זום",
        empty: "אין קורסים או סדנאות פעילים.",
      };
    case "recipes":
      return {
        title: "מתכונים",
        description: "מתכונים ותכנים מעשיים",
        empty: "אין מתכונים מפורסמים.",
      };
    case "lectures":
      return {
        title: "הרצאות",
        description: "הרצאות ומפגשי הרצאה",
        empty: "אין הרצאות מפורסמות.",
      };
  }
}

export function productMatchesPortfolioKind(type: ProductType, kind: PortfolioContentKind): boolean {
  switch (kind) {
    case "courses":
      return type === "workshop" || type === "zoom";
    case "recipes":
      return type === "recipe";
    case "lectures":
      return type === "lecture";
    default:
      return false;
  }
}

export function productKindLabel(type: ProductType): string {
  return productTypeLabel(type);
}

export function articlesToBlogList(
  rows: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    category: string | null;
    coverImageUrl: string | null;
    updatedAt: Date;
  }[],
  therapistProfileId?: string,
): BlogStyleListItem[] {
  const fallback = therapistProfileId ? therapistPublicHref(therapistProfileId) : "/therapists";
  return rows.map((a) => ({
    id: a.id,
    href: herbalArticleHref(a.slug, fallback),
    title: a.title,
    excerpt: a.excerpt,
    imageUrl: a.coverImageUrl,
    date: a.updatedAt,
    kindLabel: "מאמר",
    category: a.category,
  }));
}

export function productsToBlogList(
  rows: {
    id: string;
    type: ProductType;
    title: string;
    description: string;
    imageUrl: string | null;
    createdAt: Date;
  }[],
): BlogStyleListItem[] {
  return rows.map((p) => ({
    id: p.id,
    href: publicProductHref(p.id),
    title: p.title,
    excerpt: p.description,
    imageUrl: p.imageUrl,
    date: p.createdAt,
    kindLabel: productKindLabel(p.type),
  }));
}

export function therapistContentHref(profileId: string, kind: PortfolioContentKind): string {
  return `/therapists/${profileId}/content/${kind}`;
}
