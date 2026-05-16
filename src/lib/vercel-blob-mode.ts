/** מסיר רווחים ומרכאות ש-Vercel לפעמים שומר סביב הערך */
function stripEnv(s: string | undefined): string {
  return (s ?? "").trim().replace(/^["']|["']$/g, "");
}

/**
 * האם ל־`put` ב־Vercel Blob להשתמש ב־`access: "private"` (כשה־store פרטי).
 * עדיף `VERCEL_BLOB_PRIVATE_STORE` — נטען בזמן ריצה בשרת (לא תלוי בבילד של NEXT_PUBLIC).
 */
export function serverBlobPutIsPrivate(): boolean {
  const serverFlag = stripEnv(process.env.VERCEL_BLOB_PRIVATE_STORE).toLowerCase();
  if (["1", "true", "yes", "private"].includes(serverFlag)) return true;
  const pub = stripEnv(process.env.NEXT_PUBLIC_VERCEL_BLOB_ACCESS).toLowerCase();
  return pub === "private";
}

/**
 * `access` ל־`put()`: ב־Vercel ברירת מחדל `private` (חנויות Blob רבות פרטיות).
 * חנות ציבורית: `VERCEL_BLOB_PUBLIC_STORE=true`
 */
export function serverBlobPutAccess(): "public" | "private" {
  const forcePublic = stripEnv(process.env.VERCEL_BLOB_PUBLIC_STORE).toLowerCase();
  if (["1", "true", "yes"].includes(forcePublic)) return "public";
  if (serverBlobPutIsPrivate()) return "private";
  if (process.env.VERCEL) return "private";
  return "public";
}

/** לדפדפן — רק משתנים עם NEXT_PUBLIC זמינים ב־client bundle */
export function clientBlobNeedsMediaProxy(): boolean {
  const a = stripEnv(process.env.NEXT_PUBLIC_VERCEL_BLOB_ACCESS).toLowerCase();
  if (a === "private") return true;
  if (a === "public") return false;
  // לא הוגדר — בפרודקשן מניחים שכתובות blob עשויות להיות פרטיות (תואם ל־serverBlobPutAccess ברירת מחדל ב־Vercel)
  return process.env.NODE_ENV === "production";
}
