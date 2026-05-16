import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extFromMime(mime: string): "png" | "webp" | "gif" | "jpg" {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

/**
 * שמירת תמונה: בפרודקשן על Vercel — Vercel Blob (כש־`BLOB_READ_WRITE_TOKEN` מוגדר).
 * בפיתוח מקומי — תחת `public/uploads/{prefix}/`.
 */
export async function saveUploadedImageBuffer(buffer: Buffer, mime: string, prefix: string): Promise<string> {
  if (!ALLOWED.has(mime)) {
    throw new Error("סוג קובץ לא נתמך — JPG, PNG, WebP או GIF בלבד");
  }
  if (buffer.length > MAX_BYTES) {
    throw new Error("הקובץ גדול מדי (מקסימום 5MB)");
  }

  const ext = extFromMime(mime);
  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const blobKey = `herbal/${prefix}/${filename}`;

  const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
  if (hasBlobToken) {
    const { put } = await import("@vercel/blob");
    const blob = await put(blobKey, buffer, {
      access: "public",
      contentType: mime,
    });
    return blob.url;
  }

  const dir = path.join(process.cwd(), "public", "uploads", prefix);
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);
  } catch (e) {
    const code = e && typeof e === "object" && "code" in e ? String((e as NodeJS.ErrnoException).code) : "";
    if (code === "ENOENT" || code === "EROFS" || code === "EACCES") {
      throw new Error(
        "לא ניתן לכתוב קבצים לשרת (ב‑Vercel הדיסק read‑only). יש ליצור Blob Store בפרויקט ב‑Vercel ולהוסיף למשתני הסביבה BLOB_READ_WRITE_TOKEN (ראו .env.example).",
      );
    }
    throw e;
  }
  return `/uploads/${prefix}/${filename}`;
}

export async function saveUploadedImageDataUrl(dataUrl: string, prefix: string): Promise<string> {
  const match = /^data:(image\/\w+);base64,(.*)$/.exec(dataUrl);
  if (!match) throw new Error("פורמט תמונה לא תקין");
  const buf = Buffer.from(match[2]!, "base64");
  return saveUploadedImageBuffer(buf, match[1]!, prefix);
}
