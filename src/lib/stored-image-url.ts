import { z } from "zod";
import { publicDisplayImageUrl } from "@/lib/blob-image-url";

/**
 * כתובת תמונה שנשמרה במסד / בטופס: https, http, protocol-relative, /uploads, או proxy ל־Blob.
 * (בדף הציבורי היה תנאי צר מדי — URL תקין שלא התחיל בדיוק ב־https הוחלף ב־placeholder דמה.)
 */
export function isStoredImageUrl(url: string | null | undefined): boolean {
  const u = url?.trim();
  if (!u) return false;
  return (
    u.startsWith("https://") ||
    u.startsWith("http://") ||
    u.startsWith("//") ||
    u.startsWith("/uploads/") ||
    u.startsWith("/api/blob-media")
  );
}

/** לאחוד תצוגה: protocol-relative ו־http → https (Blob / CDN). */
export function normalizeHttpsImageReference(url: string): string {
  const t = url.trim();
  if (t.startsWith("//")) return `https:${t}`;
  if (t.startsWith("http://")) return `https://${t.slice(7)}`;
  return t;
}

/** מחזיר כתובת תמונה תקינה או null — לשימוש ב-src של img */
export function storedImageSrc(url: string | null | undefined): string | null {
  if (!isStoredImageUrl(url)) return null;
  return publicDisplayImageUrl(normalizeHttpsImageReference(url!)) || null;
}

export const storedImageUrlSchema = z
  .string()
  .min(1)
  .refine(isStoredImageUrl, "יש לבחור תמונה (Unsplash או העלאה מהמחשב)");
