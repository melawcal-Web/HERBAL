import { z } from "zod";
import { publicDisplayImageUrl } from "@/lib/blob-image-url";

/** Unsplash https URL or local upload path saved under /public/uploads */
export function isStoredImageUrl(url: string | null | undefined): boolean {
  const u = url?.trim();
  if (!u) return false;
  return u.startsWith("https://") || u.startsWith("/uploads/");
}

/** מחזיר כתובת תמונה תקינה או null — לשימוש ב-src של img */
export function storedImageSrc(url: string | null | undefined): string | null {
  if (!isStoredImageUrl(url)) return null;
  return publicDisplayImageUrl(url!.trim()) || null;
}

export const storedImageUrlSchema = z
  .string()
  .min(1)
  .refine(isStoredImageUrl, "יש לבחור תמונה (Unsplash או העלאה מהמחשב)");
