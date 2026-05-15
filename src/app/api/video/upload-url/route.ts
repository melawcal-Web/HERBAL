import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertTherapist } from "@/lib/formula";

/**
 * מחזיר כתובת העלאה חתומה ל-Vimeo או Bunny.net (שרת בלבד).
 * הגדירו: BUNNY_LIBRARY_ID, BUNNY_API_KEY או VIMEO_ACCESS_TOKEN
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !assertTherapist(session.user.role)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { provider?: string; title?: string };
  const provider = body.provider === "vimeo" ? "vimeo" : "bunny";

  if (provider === "bunny") {
    const libraryId = process.env.BUNNY_LIBRARY_ID;
    const apiKey = process.env.BUNNY_API_KEY;
    if (!libraryId || !apiKey) {
      return NextResponse.json(
        { error: "Bunny.net לא מוגדר — הגדירו BUNNY_LIBRARY_ID ו-BUNNY_API_KEY" },
        { status: 503 },
      );
    }
    const res = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
      method: "POST",
      headers: { AccessKey: apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ title: body.title ?? "תוכן HERBAL" }),
    });
    if (!res.ok) {
      return NextResponse.json({ error: "שגיאה ביצירת וידאו ב-Bunny" }, { status: 502 });
    }
    const data = (await res.json()) as { guid?: string };
    return NextResponse.json({
      provider: "bunny",
      videoId: data.guid,
      uploadUrl: `https://video.bunnycdn.com/library/${libraryId}/videos/${data.guid}`,
      message: "העלו את הקובץ ב-PUT לכתובת uploadUrl עם כותרת AccessKey",
    });
  }

  const vimeoToken = process.env.VIMEO_ACCESS_TOKEN;
  if (!vimeoToken) {
    return NextResponse.json({ error: "Vimeo לא מוגדר — הגדירו VIMEO_ACCESS_TOKEN" }, { status: 503 });
  }

  const res = await fetch("https://api.vimeo.com/me/videos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${vimeoToken}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.vimeo.*+json;version=3.4",
    },
    body: JSON.stringify({
      upload: { approach: "tus", size: null },
      name: body.title ?? "תוכן HERBAL",
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "שגיאה ביצירת וידאו ב-Vimeo" }, { status: 502 });
  }

  const data = (await res.json()) as { uri?: string; upload?: { upload_link?: string } };
  const videoId = data.uri?.split("/").pop();
  return NextResponse.json({
    provider: "vimeo",
    videoId,
    uploadUrl: data.upload?.upload_link,
    playbackNote: "השתמשו ב-Vimeo player עם signed URL בפרודקשן",
  });
}
