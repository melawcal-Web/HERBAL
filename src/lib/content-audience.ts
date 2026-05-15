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
