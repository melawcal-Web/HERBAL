"use server";

export type UnsplashSearchResult = {
  id: string;
  description: string | null;
  thumbUrl: string;
  imageUrl: string;
};

/**
 * חיפוש תמונות ב-Unsplash (דורש UNSPLASH_ACCESS_KEY ב-.env).
 * מחזיר רשימה ריקה אם המפתח לא הוגדר — ללא זריקת שגיאה.
 */
export async function searchUnsplashPhotos(query: string): Promise<UnsplashSearchResult[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!key) return [];

  const q = query.trim().slice(0, 100);
  if (!q) return [];

  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", q);
  url.searchParams.set("per_page", "12");
  url.searchParams.set("orientation", "landscape");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Client-ID ${key}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`חיפוש Unsplash נכשל (${res.status})`);
  }

  const json = (await res.json()) as {
    results?: Array<{
      id: string;
      description?: string | null;
      alt_description?: string | null;
      urls?: { thumb?: string; small?: string; regular?: string; full?: string };
    }>;
  };

  const out: UnsplashSearchResult[] = [];
  for (const r of json.results ?? []) {
    const full = r.urls?.regular ?? r.urls?.full ?? r.urls?.small;
    const thumb = r.urls?.thumb ?? r.urls?.small ?? full;
    if (!full?.startsWith("https://")) continue;
    if (!thumb?.startsWith("https://")) continue;
    out.push({
      id: r.id,
      description: r.description ?? r.alt_description ?? null,
      thumbUrl: thumb,
      imageUrl: `${full.split("?")[0]}?auto=format&fit=crop&w=1400&q=80`,
    });
  }
  return out;
}
