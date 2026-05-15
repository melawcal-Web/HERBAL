import type { PriceCategory } from "@prisma/client";
import { Prisma } from "@prisma/client";

/** עמלת מרכז על מחיר רגיל */
export const CENTER_COMMISSION_RATE = 0.15;

export function centerCommissionForAmount(amountNis: number, priceCategory: PriceCategory): number {
  if (priceCategory !== "regular" || amountNis <= 0) return 0;
  return Math.round(amountNis * CENTER_COMMISSION_RATE * 100) / 100;
}

export function decimalFromNumber(n: number): Prisma.Decimal {
  return new Prisma.Decimal(n);
}

export function priceCategoryLabel(cat: PriceCategory): string {
  switch (cat) {
    case "free":
      return "חינם";
    case "member":
      return "חבר קהילה";
    case "regular":
      return "מחיר מלא";
    default:
      return cat;
  }
}

export function contentKindLabel(kind: string): string {
  const map: Record<string, string> = {
    video: "וידאו",
    podcast: "פודקאסט",
    article: "מאמר",
    recipe: "מתכון",
    lecture: "הרצאה",
    course: "קורס",
    zoom: "זום",
    supervision: "השגחה",
    shelf_product: "מוצר",
    workshop: "סדנה",
  };
  return map[kind] ?? kind;
}
