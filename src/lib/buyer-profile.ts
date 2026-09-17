import { normalizeIlMobile } from "@/lib/therapist-payments";

export const DIGITAL_UNPAID_STRIKE_LIMIT = 3;

export function isBuyerProfileComplete(input: {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
} | null | undefined): boolean {
  if (!input) return false;
  const name = input.name?.trim() ?? "";
  const email = input.email?.trim() ?? "";
  const phone = input.phone ? normalizeIlMobile(input.phone) : null;
  return name.length >= 2 && email.includes("@") && Boolean(phone);
}

export function buyerAccountProfileHref(callbackPath: string): string {
  const path = callbackPath.startsWith("/") && !callbackPath.startsWith("//") ? callbackPath : "/";
  return `/account/profile?callbackUrl=${encodeURIComponent(path)}`;
}

export function digitalPurchaseBlockedMessage(): string {
  return "הרכישה חסומה לאחר שלוש כוונות תשלום שסומנו «התשלום לא התקבל». פנו למטפל/ת או לתמיכת המרכז.";
}
