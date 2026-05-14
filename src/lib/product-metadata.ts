import type { Prisma } from "@prisma/client";

/** JSON on `Product.metadata` for קורסים וסדנאות */
export type ProductMetadata = {
  location?: string;
  /** ISO 8601 */
  startsAt?: string;
  maxParticipants?: number;
  zoomUrl?: string;
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
  return out;
}
