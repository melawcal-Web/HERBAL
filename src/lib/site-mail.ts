/**
 * שליחת מייל דרך Resend (אופציונלי). דורש RESEND_API_KEY ו־MAIL_FROM באותו דומיין מאומת.
 * אם לא מוגדר — מחזיר ok: false בלי לזרוק שגיאה.
 */
export async function sendSiteTransactionalEmail(input: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ ok: boolean; skippedReason?: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.MAIL_FROM?.trim();
  if (!key || !from) {
    return { ok: false, skippedReason: "missing_resend_or_from" };
  }
  const to = input.to.trim().toLowerCase();
  if (!to.includes("@")) return { ok: false, skippedReason: "invalid_to" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: input.subject.slice(0, 998),
      text: input.text.slice(0, 100_000),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.warn("[sendSiteTransactionalEmail]", res.status, body.slice(0, 500));
    return { ok: false, skippedReason: `resend_http_${res.status}` };
  }
  return { ok: true };
}
