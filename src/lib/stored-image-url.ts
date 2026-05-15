import { z } from "zod";

/** Unsplash https URL or local upload path saved under /public/uploads */
export function isStoredImageUrl(url: string | null | undefined): boolean {
  const u = url?.trim();
  if (!u) return false;
  return u.startsWith("https://") || u.startsWith("/uploads/");
}

export const storedImageUrlSchema = z
  .string()
  .min(1)
  .refine(isStoredImageUrl, "יש לבחור תמונה (Unsplash או העלאה מהמחשב)");
