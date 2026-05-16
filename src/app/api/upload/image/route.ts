import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertAdmin, assertTherapist } from "@/lib/formula";
import { saveUploadedImageBuffer } from "@/lib/save-uploaded-image";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "נדרשת התחברות" }, { status: 401 });
  }
  const ok = assertAdmin(session.user.role) || assertTherapist(session.user.role);
  if (!ok) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "לא נבחר קובץ" }, { status: 400 });
  }

  const rawPrefix = form.get("prefix");
  const prefix =
    rawPrefix === "profiles" || rawPrefix === "profile" ? "profiles" : "content";
  const buf = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "image/jpeg";

  try {
    const url = await saveUploadedImageBuffer(buf, mime, prefix);
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "העלאה נכשלה" }, { status: 400 });
  }
}
