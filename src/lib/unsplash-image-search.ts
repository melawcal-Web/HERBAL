import { translateHebrewToEnglish } from "@/lib/translate-he-en";
import { getUnsplashAccessKeyFromConfig } from "@/lib/site-config";

export type UnsplashHit = { id: string; thumb: string; full: string };

/** Server-side Unsplash search (9 results). Caller must enforce auth. */
export async function searchUnsplashFromHebrewQuery(qHebrew: string): Promise<{ queryEn: string; results: UnsplashHit[] }> {
  const key =
    process.env.UNSPLASH_ACCESS_KEY?.trim() || (await getUnsplashAccessKeyFromConfig())?.trim() || null;
  if (!key) {
    throw new Error("MISSING_UNSPLASH_KEY");
  }

  const t = qHebrew.trim();
  if (!t) {
    throw new Error("EMPTY_QUERY");
  }

  const english = await translateHebrewToEnglish(t);
  const searchParts = [english, t].filter((s, i, arr) => s.length > 0 && arr.indexOf(s) === i);
  const searchQuery = searchParts.join(" ");

  const usp = new URLSearchParams({
    query: searchQuery.slice(0, 200),
    per_page: "9",
    orientation: "landscape",
  });

  const res = await fetch(`https://api.unsplash.com/search/photos?${usp}`, {
    headers: { Authorization: `Client-ID ${key}` },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error("UNSPLASH_HTTP");
  }

  const data = (await res.json()) as {
    results?: Array<{ id: string; urls?: { thumb?: string; small?: string; regular?: string; raw?: string } }>;
  };

  const results: UnsplashHit[] = (data.results ?? []).slice(0, 9).map((r) => {
    const raw = r.urls?.raw ?? r.urls?.regular ?? r.urls?.small ?? "";
    const full =
      raw && raw.includes("?")
        ? `${raw}&w=1600&q=85&fit=crop&auto=format`
        : raw
          ? `${raw}?w=1600&q=85&fit=crop&auto=format`
          : "";
    return {
      id: r.id,
      thumb: r.urls?.thumb ?? r.urls?.small ?? full,
      full,
    };
  });

  return { queryEn: english, results };
}
