/**
 * Herbal plant index (אינדקס צמחים) is hidden from the public product.
 * Mor asked to take it down for now and restore later if needed.
 *
 * To bring it back:
 * 1. Set `HERBAL_INDEX_ENABLED` to `true` below, or
 * 2. Set env `NEXT_PUBLIC_HERBAL_INDEX_ENABLED=true`
 *
 * Do not delete `/herbal-index` page files — they stay behind this flag.
 */
const HERBAL_INDEX_ENABLED = false;

export function isHerbalIndexEnabled(): boolean {
  const env = process.env.NEXT_PUBLIC_HERBAL_INDEX_ENABLED?.trim().toLowerCase();
  if (env === "true" || env === "1") return true;
  if (env === "false" || env === "0") return false;
  return HERBAL_INDEX_ENABLED;
}

export function herbalIndexListPath(): string {
  return "/herbal-index";
}

export function herbalIndexArticlePath(slug: string): string {
  return `/herbal-index/${encodeURIComponent(slug)}`;
}

/** Where members land when the index is hidden (home) or shown (index). */
export function memberLandingPath(): string {
  return isHerbalIndexEnabled() ? herbalIndexListPath() : "/";
}

export function herbalIndexHref(): string {
  return isHerbalIndexEnabled() ? herbalIndexListPath() : memberLandingPath();
}

/** Article URL when the index is on; otherwise a working fallback (therapist page, etc.). */
export function herbalArticleHref(slug: string, fallback: string): string {
  return isHerbalIndexEnabled() ? herbalIndexArticlePath(slug) : fallback;
}

/** Strip herbal-index marketing copy from public text while the feature is hidden. */
export function hideHerbalIndexPublicCopy(text: string): string {
  if (isHerbalIndexEnabled() || !text) return text;
  return text
    .replace(/לצד אינדקס צמחים עם מאמרים מקוריים ממטפלים רשומים/g, "ומאמרים מקוריים ממטפלים רשומים")
    .replace(/,\s*ואינדקס צמחים/g, "")
    .replace(/ואינדקס צמחים/g, "")
    .replace(/אינדקס צמחים/g, "מאמרים")
    .replace(/\s*Herbal Index\s*/gi, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ +\./g, ".")
    .trim();
}
