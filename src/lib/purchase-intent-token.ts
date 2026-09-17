import { createHmac, timingSafeEqual } from "crypto";

export type PurchaseIntentEmailAction = "unpaid" | "paid";

function signingSecret(): string {
  return process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim() || "";
}

export function signPurchaseIntentAction(acquisitionId: string, action: PurchaseIntentEmailAction): string {
  const secret = signingSecret();
  if (!secret) throw new Error("חסר מפתח חתימה לקישור פעולה");
  return createHmac("sha256", secret).update(`${acquisitionId}.${action}`).digest("base64url");
}

export function verifyPurchaseIntentAction(
  acquisitionId: string,
  action: PurchaseIntentEmailAction,
  signature: string,
): boolean {
  if (!acquisitionId || !signature) return false;
  try {
    const expected = signPurchaseIntentAction(acquisitionId, action);
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function purchaseIntentActionPath(
  acquisitionId: string,
  action: PurchaseIntentEmailAction,
): string {
  const sig = signPurchaseIntentAction(acquisitionId, action);
  const q = new URLSearchParams({ id: acquisitionId, sig });
  return `/purchase-intents/${action}?${q.toString()}`;
}
