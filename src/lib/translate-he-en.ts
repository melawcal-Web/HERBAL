/**
 * Best-effort Hebrew → English for Unsplash search (server-side only).
 * Uses MyMemory public API; falls back to the original text on failure.
 */
export async function translateHebrewToEnglish(text: string): Promise<string> {
  const t = text.trim();
  if (!t) return "";

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(t)}&langpair=he|en`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return t;
    const data = (await res.json()) as {
      responseData?: { translatedText?: string };
      responseStatus?: number;
    };
    const out = data.responseData?.translatedText?.trim();
    if (out && out.length > 0) return out;
  } catch {
    /* ignore */
  }
  return t;
}
