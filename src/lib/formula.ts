import type { UserRole } from "@prisma/client";

export type FormulaIngredient = {
  name: string;
  grams: number;
};

export type FormulaJson = {
  ingredients: FormulaIngredient[];
  note?: string;
};

export function computeFormulaPercentages(formula: FormulaJson): Array<
  FormulaIngredient & { percent: number }
> {
  const ingredients = formula.ingredients ?? [];
  const total = ingredients.reduce((sum, i) => sum + (Number(i.grams) || 0), 0);
  if (total <= 0) {
    return ingredients.map((i) => ({ ...i, percent: 0 }));
  }
  return ingredients.map((i) => ({
    ...i,
    percent: Math.round(((Number(i.grams) || 0) / total) * 10000) / 100,
  }));
}

export function assertTherapist(role: UserRole) {
  return role === "therapist" || role === "admin";
}

export function assertAdmin(role: UserRole) {
  return role === "admin";
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}
