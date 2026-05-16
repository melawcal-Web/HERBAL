"use server";

import { auth } from "@/auth";
import { assertAdmin, assertTherapist } from "@/lib/formula";
import { saveUploadedImageBuffer } from "@/lib/save-uploaded-image";

/**
 * העלאת תמונה (פרופיל או תוכן) — Server Action עם אותה אימות סשן כמו שמירת הפרופיל,
 * כדי למנוע כשלי cookies / fetch בין לשוניות או ב-Turbopack.
 */
export async function uploadUserImage(formData: FormData): Promise<{ url: string } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "נדרשת התחברות — התחברו מחדש ונסו שוב." };
  }
  if (!assertAdmin(session.user.role) && !assertTherapist(session.user.role)) {
    return { error: "אין הרשאה להעלאה." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "לא נבחר קובץ תקין." };
  }

  const rawPrefix = formData.get("prefix");
  const prefix =
    rawPrefix === "profiles" || rawPrefix === "profile" ? "profiles" : "content";

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const mime = file.type || "image/jpeg";
    const url = await saveUploadedImageBuffer(buf, mime, prefix);
    return { url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "העלאה נכשלה" };
  }
}
