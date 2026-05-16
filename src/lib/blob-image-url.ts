import { clientBlobNeedsMediaProxy } from "@/lib/vercel-blob-mode";

/**
 * כש־Blob Store ב־Vercel מוגדר כ־Private, כתובת ה־URL לא נטענת ב־img בלי Authorization.
 * במצב זה מפנים ל־`/api/blob-media` שמזרים את הקובץ עם הטוקן.
 */
function isVercelBlobUrl(url: string): boolean {
  try {
    const h = new URL(url).hostname;
    return h.endsWith("blob.vercel-storage.com");
  } catch {
    return false;
  }
}

/** כתובת לתצוגה בדפדפן (עוברת דרך proxy כשהבלוב פרטי). */
export function publicDisplayImageUrl(url: string | null | undefined): string {
  const raw = url?.trim() ?? "";
  if (!raw) return "";
  if (!clientBlobNeedsMediaProxy()) return raw;
  if (!isVercelBlobUrl(raw)) return raw;
  return `/api/blob-media?u=${encodeURIComponent(raw)}`;
}
