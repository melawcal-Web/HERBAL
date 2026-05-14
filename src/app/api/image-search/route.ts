import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertAdmin, assertTherapist } from "@/lib/formula";
import { searchUnsplashFromHebrewQuery } from "@/lib/unsplash-image-search";

/** Smart image search: admin (תוכן) או מטפל (תמונת פרופיל). */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "נדרשת התחברות" }, { status: 401 });
  }

  const ok = assertAdmin(session.user.role) || assertTherapist(session.user.role);
  if (!ok) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
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

  try {
    const { queryEn, results } = await searchUnsplashFromHebrewQuery(q);
    return NextResponse.json({ queryEn, results });
  } catch (e) {
    if (e instanceof Error && e.message === "MISSING_UNSPLASH_KEY") {
      return NextResponse.json({ error: "חסר מפתח Unsplash בשרת (UNSPLASH_ACCESS_KEY)" }, { status: 503 });
    }
    return NextResponse.json({ error: "חיפוש תמונות נכשל" }, { status: 502 });
  }
}
