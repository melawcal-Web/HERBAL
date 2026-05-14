import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertAdmin } from "@/lib/formula";
import { translateHebrewToEnglish } from "@/lib/translate-he-en";

type UnsplashResult = { id: string; thumb: string; full: string };

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !assertAdmin(session.user.role)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!key) {
    return NextResponse.json({ error: "חסר מפתח Unsplash בשרת (UNSPLASH_ACCESS_KEY)" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "גוף בקשה לא תקין" }, { status: 400 });
  }
  const q = typeof body === "object" && body && "q" in body ? String((body as { q: unknown }).q ?? "").trim() : "";
  if (q.length < 1) {
    return NextResponse.json({ error: "יש להזין מילת חיפוש" }, { status: 400 });
  }

  const english = await translateHebrewToEnglish(q);
  const searchParts = [english, q].filter((s, i, arr) => s.length > 0 && arr.indexOf(s) === i);
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
    return NextResponse.json({ error: "חיפוש תמונות נכשל" }, { status: 502 });
  }

  const data = (await res.json()) as {
    results?: Array<{ id: string; urls?: { thumb?: string; small?: string; regular?: string; raw?: string } }>;
  };

  const results: UnsplashResult[] = (data.results ?? []).slice(0, 9).map((r) => {
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

  return NextResponse.json({ queryEn: english, results });
}
