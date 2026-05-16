import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Proxy לתמונות ב־Vercel Blob כשה־store פרטי — הדפדפן לא שולח את BLOB_READ_WRITE_TOKEN.
 * רק כתובות blob.vercel-storage.com מותרות (מניעת SSRF).
 */
export async function GET(req: Request) {
  const u = new URL(req.url).searchParams.get("u");
  if (!u?.trim()) {
    return NextResponse.json({ error: "חסר פרמטר u" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(u);
  } catch {
    return NextResponse.json({ error: "כתובת לא תקינה" }, { status: 400 });
  }

  if (target.protocol !== "https:" || !target.hostname.endsWith("blob.vercel-storage.com")) {
    return NextResponse.json({ error: "כתובת לא מורשית" }, { status: 403 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN לא מוגדר" }, { status: 503 });
  }

  const upstream = await fetch(target.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    redirect: "follow",
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: upstream.status === 404 ? "הקובץ לא נמצא" : "לא ניתן לטעון את התמונה" },
      { status: upstream.status === 404 ? 404 : 502 },
    );
  }

  const contentType = upstream.headers.get("Content-Type") || "application/octet-stream";
  const body = upstream.body;
  if (!body) {
    return NextResponse.json({ error: "גוף ריק" }, { status: 502 });
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
