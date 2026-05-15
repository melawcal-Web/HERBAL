import type { ContentAudienceId } from "@/lib/content-audience";
import type { ContentFilterType } from "@/components/search/ContentSearchFilter";
import { parseProductTags, parseProductAudience } from "@/lib/product-metadata";

export type ContentSearchParams = {
  q?: string;
  tag?: string;
  type?: ContentFilterType;
  audience?: ContentAudienceId | null;
  therapistUserId?: string;
};

function textMatch(haystack: string, needle: string): boolean {
  if (!needle) return true;
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function tagMatch(tags: string[], tag: string, title: string, extra: string): boolean {
  if (!tag) return true;
  const t = tag.toLowerCase();
  if (tags.some((x) => x.toLowerCase().includes(t))) return true;
  return title.toLowerCase().includes(t) || extra.toLowerCase().includes(t);
}

function audienceMatch(raw: unknown, audience: ContentAudienceId | null | undefined): boolean {
  if (!audience) return true;
  const ids = parseProductAudience(raw);
  return ids.length === 0 || ids.includes(audience);
}

export function filterTherapistRow<T extends { user: { name: string }; bio: string; specialty1: string; specialty2: string; specialty3: string }>(
  row: T,
  p: ContentSearchParams,
): boolean {
  if (p.type && p.type !== "all" && p.type !== "therapist") return false;
  const q = (p.q ?? "").trim();
  const tag = (p.tag ?? "").trim();
  const blob = `${row.user.name} ${row.bio} ${row.specialty1} ${row.specialty2} ${row.specialty3}`;
  if (q && !textMatch(blob, q)) return false;
  if (tag && !tagMatch([], tag, row.user.name, blob)) return false;
  return true;
}

export function filterProductRow<
  T extends {
    title: string;
    description: string;
    tags: unknown;
    audience: unknown;
    therapistId: string | null;
  },
>(row: T, p: ContentSearchParams): boolean {
  if (p.therapistUserId && row.therapistId !== p.therapistUserId) return false;
  if (p.type && p.type !== "all" && p.type !== "product") return false;
  if (!audienceMatch(row.audience, p.audience)) return false;
  const q = (p.q ?? "").trim();
  const tag = (p.tag ?? "").trim();
  const tags = parseProductTags(row.tags);
  const blob = `${row.title} ${row.description}`;
  if (q && !textMatch(blob, q)) return false;
  if (tag && !tagMatch(tags, tag, row.title, blob)) return false;
  return true;
}

export function filterArticleRow<
  T extends {
    title: string;
    excerpt: string;
    category: string | null;
    tags: unknown;
    audience: unknown;
    therapistId: string;
  },
>(row: T, p: ContentSearchParams): boolean {
  if (p.therapistUserId && row.therapistId !== p.therapistUserId) return false;
  if (p.type && p.type !== "all" && p.type !== "article") return false;
  if (!audienceMatch(row.audience, p.audience)) return false;
  const q = (p.q ?? "").trim();
  const tag = (p.tag ?? "").trim();
  const tags = parseProductTags(row.tags);
  const blob = `${row.title} ${row.excerpt} ${row.category ?? ""}`;
  if (q && !textMatch(blob, q)) return false;
  if (tag && !tagMatch(tags, tag, row.title, blob)) return false;
  return true;
}
