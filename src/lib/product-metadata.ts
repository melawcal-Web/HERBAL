import type { Prisma, ProductType } from "@prisma/client";
import type { ContentAudienceId } from "@/lib/content-audience";

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
