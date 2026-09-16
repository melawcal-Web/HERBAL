import type { Prisma, ProductType } from "@prisma/client";
import type { ContentAudienceId } from "@/lib/content-audience";

export const PRODUCT_TYPE_OPTIONS = [
  { id: "shelf_product", label: "מוצר מדף / חומר דיגיטלי" },
  { id: "video", label: "וידאו" },
  { id: "recipe", label: "מתכון" },
  { id: "workshop", label: "סדנה" },
  { id: "lecture", label: "הרצאה" },
  { id: "podcast", label: "פודקאסט" },
  { id: "zoom", label: "זום" },
  { id: "supervision", label: "השגחה" },
] as const satisfies ReadonlyArray<{ id: ProductType; label: string }>;

export type ProductTypeId = (typeof PRODUCT_TYPE_OPTIONS)[number]["id"];

export function productTypeLabel(type: ProductType): string {
  return PRODUCT_TYPE_OPTIONS.find((o) => o.id === type)?.label ?? type;
}

/** סדנה / זום / השגחה נשמרים כרשימת המתנה; חומר דיגיטלי נמכר ישירות */
export function productTypeUsesWaitlist(type: ProductType): boolean {
  return type === "workshop" || type === "zoom" || type === "supervision";
}

/** קישור הורדה / קובץ דיגיטלי במטא-דאטה */
export function isProductFileUrl(url: string | null | undefined): boolean {
  const u = url?.trim();
  if (!u) return false;
  return (
    u.startsWith("https://") ||
    u.startsWith("http://") ||
    u.startsWith("/uploads/") ||
    u.startsWith("/api/")
  );
}

/** JSON on `Product.metadata` for קורסים וסדנאות */
export type ProductMetadata = {
  location?: string;
  /** ISO 8601 */
  startsAt?: string;
  maxParticipants?: number;
  zoomUrl?: string;
  /** פירוט ארוך על הקורס / המפגש */
  courseDetails?: string;
  /** זום — מפגש בודד או סדרה */
  zoomSessionMode?: "single" | "multi";
  /** השגחה — אישי או קבוצתי */
  supervisionMode?: "individual" | "group";
  /** תעריף לשעה להשגחה (מוצר) */
  hourlyRate?: number;
  /** פרקים (אקורדיון) */
  chapters?: { id: string; title: string; body: string }[];
  /** קישור חיצוני: Spotify / YouTube / פודקאסט */
  externalUrl?: string;
  externalProvider?: "spotify" | "youtube" | "podcast" | "other";
  /** וידאו — Vimeo / Bunny */
  videoProvider?: "vimeo" | "bunny";
  videoId?: string;
  playbackUrl?: string;
  /** קישור הורדה לחומר דיגיטלי (PDF, קובץ, וכו׳) */
  downloadUrl?: string;
};

export function parseProductMetadata(raw: Prisma.JsonValue | null | undefined): ProductMetadata {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  const out: ProductMetadata = {};
  if (typeof o.location === "string") out.location = o.location;
  if (typeof o.startsAt === "string") out.startsAt = o.startsAt;
  if (typeof o.maxParticipants === "number" && Number.isFinite(o.maxParticipants)) {
    out.maxParticipants = o.maxParticipants;
  }
  if (typeof o.zoomUrl === "string") out.zoomUrl = o.zoomUrl;
  if (typeof o.courseDetails === "string" && o.courseDetails.trim()) out.courseDetails = o.courseDetails.trim();
  if (o.zoomSessionMode === "single" || o.zoomSessionMode === "multi") out.zoomSessionMode = o.zoomSessionMode;
  if (o.supervisionMode === "individual" || o.supervisionMode === "group") out.supervisionMode = o.supervisionMode;
  if (typeof o.hourlyRate === "number" && Number.isFinite(o.hourlyRate)) out.hourlyRate = o.hourlyRate;
  if (typeof o.externalUrl === "string") out.externalUrl = o.externalUrl;
  if (o.externalProvider === "spotify" || o.externalProvider === "youtube" || o.externalProvider === "podcast" || o.externalProvider === "other") {
    out.externalProvider = o.externalProvider;
  }
  if (o.videoProvider === "vimeo" || o.videoProvider === "bunny") out.videoProvider = o.videoProvider;
  if (typeof o.videoId === "string") out.videoId = o.videoId;
  if (typeof o.playbackUrl === "string") out.playbackUrl = o.playbackUrl;
  if (typeof o.downloadUrl === "string" && isProductFileUrl(o.downloadUrl)) {
    out.downloadUrl = o.downloadUrl.trim();
  }
  if (Array.isArray(o.chapters)) {
    out.chapters = o.chapters
      .filter((c): c is { id: string; title: string; body: string } => {
        if (c == null || typeof c !== "object") return false;
        const ch = c as Record<string, unknown>;
        return typeof ch.title === "string";
      })
      .map((c, i) => ({
        id: (c as { id?: string }).id ?? `ch-${i}`,
        title: (c as { title: string }).title,
        body: typeof (c as { body?: string }).body === "string" ? (c as { body: string }).body : "",
      }));
  }
  return out;
}

export function parseProductTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((t): t is string => typeof t === "string" && t.trim().length > 0).map((t) => t.trim());
}

export function parseProductAudience(raw: unknown): ContentAudienceId[] {
  if (!Array.isArray(raw)) return [];
  const allowed = new Set<ContentAudienceId>(["therapist", "student", "interested"]);
  return raw.filter((x): x is ContentAudienceId => typeof x === "string" && allowed.has(x as ContentAudienceId));
}

/** מעדכן downloadUrl בלי למחוק שדות מטא-דאטה אחרים */
export function withProductDownloadUrl(
  raw: Prisma.JsonValue | null | undefined,
  downloadUrl: string | undefined,
): Prisma.InputJsonValue {
  const base =
    raw != null && typeof raw === "object" && !Array.isArray(raw)
      ? { ...(raw as Record<string, unknown>) }
      : {};
  if (downloadUrl) base.downloadUrl = downloadUrl;
  else delete base.downloadUrl;
  return base as Prisma.InputJsonValue;
}

/** מיפוי סוג מוצר לסעיף בדף מטפל */
export type TherapistOfferingSection = "tours" | "courses" | "meetings";

export function classifyProductForProfile(
  type: ProductType,
  meta: ProductMetadata,
): TherapistOfferingSection {
  if (type === "supervision") return "meetings";
  if (type === "zoom") return "courses";
  if (type === "workshop") {
    const loc = meta.location?.trim();
    if (loc && /סיור|טיול|שטח/i.test(loc + (meta.courseDetails ?? ""))) return "tours";
    return "courses";
  }
  if (type === "shelf_product") return "tours";
  return "courses";
}
