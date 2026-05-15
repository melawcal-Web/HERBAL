import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function saveUploadedImageBuffer(
  buffer: Buffer,
  mime: string,
  prefix: string,
): Promise<string> {
  if (!ALLOWED.has(mime)) {
    throw new Error("סוג קובץ לא נתמך — JPG, PNG, WebP או GIF בלבד");
  }
  if (buffer.length > MAX_BYTES) {
    throw new Error("הקובץ גדול מדי (מקסימום 5MB)");
  }

  const ext =
    mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : mime === "image/gif" ? "gif" : "jpg";
  const dir = path.join(process.cwd(), "public", "uploads", prefix);
  await mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${prefix}/${filename}`;
}

export async function saveUploadedImageDataUrl(dataUrl: string, prefix: string): Promise<string> {
  const match = /^data:(image\/\w+);base64,(.*)$/.exec(dataUrl);
  if (!match) throw new Error("פורמט תמונה לא תקין");
  const buf = Buffer.from(match[2]!, "base64");
  return saveUploadedImageBuffer(buf, match[1]!, prefix);
}
