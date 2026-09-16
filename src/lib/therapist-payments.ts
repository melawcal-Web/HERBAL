export const THERAPIST_PAYMENT_METHODS = ["bit", "paybox"] as const;
export type TherapistPaymentMethodId = (typeof THERAPIST_PAYMENT_METHODS)[number];

export type TherapistPaymentMethodConfig = {
  enabled: boolean;
  /** Israeli mobile for P2P transfer / payment request */
  phone: string;
  /** Optional Bit/PayBox payment-request URL the therapist generated in-app */
  paymentLink: string;
};

export type TherapistPaymentSettings = {
  bit: TherapistPaymentMethodConfig;
  paybox: TherapistPaymentMethodConfig;
};

const emptyMethod = (): TherapistPaymentMethodConfig => ({
  enabled: false,
  phone: "",
  paymentLink: "",
});

export function emptyTherapistPaymentSettings(): TherapistPaymentSettings {
  return { bit: emptyMethod(), paybox: emptyMethod() };
}

function asRecord(raw: unknown): Record<string, unknown> | null {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as Record<string, unknown>;
}

function strip(s: unknown): string {
  return typeof s === "string" ? s.trim() : "";
}

function parseMethod(raw: unknown): TherapistPaymentMethodConfig {
  const o = asRecord(raw);
  if (!o) return emptyMethod();
  const phone = strip(o.phone);
  const paymentLink = strip(o.paymentLink);
  const enabled = o.enabled === true && Boolean(phone || paymentLink);
  return { enabled, phone, paymentLink };
}

export function parseTherapistPaymentSettings(raw: unknown): TherapistPaymentSettings {
  const o = asRecord(raw);
  if (!o) return emptyTherapistPaymentSettings();
  return {
    bit: parseMethod(o.bit),
    paybox: parseMethod(o.paybox),
  };
}

/** Digits only; accepts 05xxxxxxxx / 9725xxxxxxxx / 5xxxxxxxx */
export function normalizeIlMobile(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  if (!d) return null;
  let national = d;
  if (d.startsWith("972") && d.length >= 12) national = `0${d.slice(3)}`;
  else if (d.startsWith("0") && d.length >= 10) national = d.slice(0, 10);
  else if (d.length === 9 && d.startsWith("5")) national = `0${d}`;
  else return null;
  if (!/^05\d{8}$/.test(national)) return null;
  return national;
}

export function ilMobileToE164(national: string): string {
  return `972${national.replace(/^0/, "")}`;
}

export function isHttpsPaymentLink(url: string): boolean {
  const t = url.trim();
  if (!t) return false;
  try {
    const u = new URL(t);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

export function paymentMethodLabel(id: TherapistPaymentMethodId): string {
  return id === "bit" ? "Bit" : "PayBox";
}

export function enabledPaymentMethods(settings: TherapistPaymentSettings): TherapistPaymentMethodId[] {
  return THERAPIST_PAYMENT_METHODS.filter((id) => {
    const m = settings[id];
    return m.enabled && Boolean(m.phone.trim() || m.paymentLink.trim());
  });
}

export type PaymentHandoff = {
  method: TherapistPaymentMethodId;
  href: string;
  phone: string | null;
  amountNis: number;
  description: string;
  /** True when href is a therapist-supplied payment-request URL */
  usesCustomLink: boolean;
};

function appendAmountToLink(link: string, amountNis: number, description: string): string {
  try {
    const u = new URL(link);
    if (!u.searchParams.has("sum") && !u.searchParams.has("amount")) {
      u.searchParams.set("sum", String(amountNis));
      u.searchParams.set("amount", String(amountNis));
    }
    if (description && !u.searchParams.has("c") && !u.searchParams.has("description")) {
      u.searchParams.set("c", description.slice(0, 80));
    }
    return u.toString();
  } catch {
    return link;
  }
}

/**
 * Build a checkout handoff URL.
 * Prefer the therapist's in-app payment-request link; otherwise open Bit/PayBox
 * toward their phone. Full merchant APIs (Tranzila / Grow) can later replace
 * the constructed URLs without changing this return shape.
 */
export function buildPaymentHandoff(
  method: TherapistPaymentMethodId,
  config: TherapistPaymentMethodConfig,
  opts: { amountNis: number; description: string },
): PaymentHandoff | null {
  const phoneNational = config.phone ? normalizeIlMobile(config.phone) : null;
  const custom = config.paymentLink.trim();
  const amount = Math.max(0, Math.round(opts.amountNis));
  const description = opts.description.trim();

  if (custom && isHttpsPaymentLink(custom)) {
    return {
      method,
      href: appendAmountToLink(custom, amount, description),
      phone: phoneNational,
      amountNis: amount,
      description,
      usesCustomLink: true,
    };
  }

  if (!phoneNational) return null;

  const href =
    method === "bit"
      ? "https://www.bitpay.co.il/"
      : "https://www.payboxapp.com/";

  return {
    method,
    href,
    phone: phoneNational,
    amountNis: amount,
    description,
    usesCustomLink: false,
  };
}

/** @internal documented for API extension — e164 is the Bit/PayBox account key */
export function paymentPhoneE164(national: string | null): string | null {
  return national ? ilMobileToE164(national) : null;
}
