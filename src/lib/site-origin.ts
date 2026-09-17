/** Absolute site origin for emails and access links (no trailing slash). */
export function publicSiteOrigin(): string {
  const raw =
    process.env.NEXTAUTH_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    (process.env.RAILWAY_PUBLIC_DOMAIN?.trim()
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN.trim().replace(/^https?:\/\//, "")}`
      : "");
  if (raw) return raw.replace(/\/$/, "");
  return "http://localhost:3000";
}
