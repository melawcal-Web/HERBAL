/** בונה נתיב + query ל־callbackUrl אחרי התחברות */
export function memberCallbackPathFromSearch(
  basePath: string,
  sp: Record<string, string | string[] | undefined>,
  keys: readonly string[],
): string {
  const u = new URLSearchParams();
  for (const key of keys) {
    const raw = sp[key];
    if (typeof raw !== "string") continue;
    const t = raw.trim();
    if (t) u.set(key, t);
  }
  const q = u.toString();
  return q ? `${basePath}?${q}` : basePath;
}
