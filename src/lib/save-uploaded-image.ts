import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { put } from "@vercel/blob";
import { serverBlobPutAccess } from "@/lib/vercel-blob-mode";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extFromMime(mime: string): "png" | "webp" | "gif" | "jpg" {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

/**
 * שמירת תמונה:
 * - ב־Vercel עם `BLOB_READ_WRITE_TOKEN` — ל־Vercel Blob
 * - ב־Railway / פיתוח מקומי — תחת `public/uploads/{prefix}/`
 *
 * ב־Railway מומלץ לחבר Volume אל `/app/public/uploads` כדי שהתמונות יישמרו קבוע.
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
    const blobAccess = serverBlobPutAccess();
    const { url } = await put(blobKey, buffer, {
      access: blobAccess,
      contentType: mime,
    });
    return url;
  }

  const dir = path.join(process.cwd(), "public", "uploads", prefix);
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);
  } catch (e) {
    const code = e && typeof e === "object" && "code" in e ? String((e as NodeJS.ErrnoException).code) : "";
    if (code === "ENOENT" || code === "EROFS" || code === "EACCES") {
      throw new Error(
        "לא ניתן לכתוב קבצים לשרת. ב־Vercel יש להגדיר BLOB_READ_WRITE_TOKEN. ב־Railway יש לחבר Volume אל /app/public/uploads.",
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
