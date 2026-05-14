/** Parsed therapist public contact (from JSON `contact_info`) */
export type ParsedContactInfo = {
  phone?: string;
  city?: string;
  whatsapp?: string;
  email?: string;
};

/** Parsed social links (from JSON `social_links`) */
export type ParsedSocialLinks = {
  website?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
};

function strip(s: unknown): string | undefined {
  if (typeof s !== "string") return undefined;
  const t = s.trim();
  return t.length ? t : undefined;
}

export function parseContactInfo(raw: unknown): ParsedContactInfo {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    phone: strip(o.phone),
    city: strip(o.city),
    whatsapp: strip(o.whatsapp),
    email: strip(o.email),
  };
}

export function parseSocialLinks(raw: unknown): ParsedSocialLinks {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    website: strip(o.website),
    instagram: strip(o.instagram),
    facebook: strip(o.facebook),
    tiktok: strip(o.tiktok),
  };
}

function onlyDigits(s: string): string {
  return s.replace(/\D/g, "");
}

/** wa.me link — only if there are digits */
export function buildWhatsAppHref(input: string): string | null {
  const d = onlyDigits(input);
  if (!d) return null;
  return `https://wa.me/${d}`;
}

export function buildTelHref(phone: string): string {
  const trimmed = phone.trim();
  return `tel:${encodeURIComponent(trimmed)}`;
}

export function isProbablyValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export function buildMailto(email: string): string {
  return `mailto:${email.trim()}`;
}

function ensureHttpUrl(url: string): string | null {
  const t = url.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  if (/^\/\//.test(t)) return `https:${t}`;
  return `https://${t}`;
}

export function buildWebsiteHref(website: string): string | null {
  return ensureHttpUrl(website);
}

/** Accepts @handle, handle, or full URL */
export function buildTikTokHref(tiktok: string): string | null {
  const t = tiktok.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  const handle = t.replace(/^@/, "").replace(/\/+$/, "");
  if (!handle) return null;
  return `https://www.tiktok.com/@${encodeURIComponent(handle)}`;
}

/** Accepts @handle, handle, or full URL */
export function buildInstagramHref(instagram: string): string | null {
  const t = instagram.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  const handle = t.replace(/^@/, "").replace(/\/+$/, "");
  if (!handle) return null;
  return `https://www.instagram.com/${encodeURIComponent(handle)}/`;
}

/** Accepts profile URL or short handle / page name */
export function buildFacebookHref(facebook: string): string | null {
  const t = facebook.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  const path = t.replace(/^@/, "").replace(/\/+$/, "");
  if (!path) return null;
  return `https://www.facebook.com/${encodeURIComponent(path)}`;
}
