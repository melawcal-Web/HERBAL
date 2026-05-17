import type { RegistrationPersona } from "@prisma/client";
import type { UserRole } from "@prisma/client";

/** קהל יעד לתוכן — תואם RegistrationPersona */
export const CONTENT_AUDIENCE_OPTIONS = [
  { id: "therapist", label: "מטפל" },
  { id: "student", label: "סטודנט" },
  { id: "interested", label: "חבר קהילה" },
] as const;

export type ContentAudienceId = (typeof CONTENT_AUDIENCE_OPTIONS)[number]["id"];

export function parseAudience(raw: unknown): ContentAudienceId[] {
  if (!Array.isArray(raw)) return [];
  const allowed = new Set(CONTENT_AUDIENCE_OPTIONS.map((o) => o.id));
  return raw.filter((x): x is ContentAudienceId => typeof x === "string" && allowed.has(x as ContentAudienceId));
}

export function audienceLabels(ids: ContentAudienceId[]): string {
  if (ids.length === 0) return "";
  return ids
    .map((id) => CONTENT_AUDIENCE_OPTIONS.find((o) => o.id === id)?.label ?? id)
    .join(" · ");
}

export type ContentViewer = {
  userId: string;
  role: UserRole;
  registrationPersona: RegistrationPersona | null;
};

/** מי רואה פריט לפי קהל יעד שהוגדר ביצירת הקורס/מאמר */
export function contentVisibleForViewer(audienceRaw: unknown, viewer: ContentViewer | null): boolean {
  const allowed = parseAudience(audienceRaw);
  if (allowed.length === 0) return true;
  if (!viewer) return false;
  if (viewer.role === "admin") return true;

  const persona = viewer.registrationPersona;
  if (!persona) {
    if (viewer.role === "therapist") return allowed.includes("therapist");
    return allowed.includes("interested");
  }

  return allowed.includes(persona as ContentAudienceId);
}
