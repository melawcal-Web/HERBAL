import { prisma } from "@/lib/prisma";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function saveUploadedImageBuffer(buffer: Buffer, mime: string, _prefix: string): Promise<string> {
  if (!ALLOWED.has(mime)) {
    throw new Error("סוג קובץ לא נתמך — JPG, PNG, WebP או GIF בלבד");
  }
  if (buffer.length > MAX_BYTES) {
    throw new Error("הקובץ גדול מדי (מקסימום 5MB)");
  }

  const record = await prisma.uploadedImage.create({
    data: { mime, data: new Uint8Array(buffer) },
    select: { id: true },
  });

  return `/api/images/${record.id}`;
}

export async function saveUploadedImageDataUrl(dataUrl: string, prefix: string): Promise<string> {
  const match = /^data:(image\/\w+);base64,(.*)$/.exec(dataUrl);
  if (!match) throw new Error("פורמט תמונה לא תקין");
  const buf = Buffer.from(match[2]!, "base64");
  return saveUploadedImageBuffer(buf, match[1]!, prefix);
}
