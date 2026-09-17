"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { registerDigitalProductPurchase } from "@/app/actions/commerce";
import { PaymentMethodLogo } from "@/components/products/PaymentMethodLogo";
import {
  paymentMethodLabel,
  type PaymentHandoff,
  type TherapistPaymentMethodId,
} from "@/lib/therapist-payments";

function money(n: number) {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(n);
}

function formatIlPhone(national: string): string {
  if (!/^05\d{8}$/.test(national)) return national;
  return `${national.slice(0, 3)}-${national.slice(3, 6)}-${national.slice(6)}`;
}

export function DigitalProductCheckout({
  productId,
  amountNis,
  handoffs,
  defaultName = "",
  defaultEmail = "",
}: {
  productId: string;
  amountNis: number;
  handoffs: PaymentHandoff[];
  defaultName?: string;
  defaultEmail?: string;
}) {
  const { data: session } = useSession();
  const [picked, setPicked] = useState<TherapistPaymentMethodId | null>(null);
  const [opened, setOpened] = useState(false);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ accessPath: string; emailSent: boolean } | null>(null);

  if (handoffs.length === 0) {
    return (
      <div
        className="rounded-2xl border border-dashed border-herbal-200 bg-herbal-50/70 px-4 py-5 text-sm leading-relaxed text-slate-700"
        role="status"
      >
        <p className="font-semibold text-herbal-900">אין אמצעי תשלום זמין למוצר זה</p>
        <p className="mt-2">
          המטפל/ת עדיין לא הגדיר/ה Bit, PayBox או קישור Grow. לא ניתן להשלים רכישה מכאן — פנו למטפל/ת
          ישירות מהפרופיל הציבורי.
        </p>
      </div>
    );
  }

  const active = picked ? handoffs.find((h) => h.method === picked) : null;

  function openMethod(h: PaymentHandoff) {
    setPicked(h.method);
    setOpened(true);
    setErr(null);
    window.open(h.href, "_blank", "noopener,noreferrer");
  }

  if (result) {
    return (
      <div className="rounded-2xl border border-herbal-200 bg-white p-4 shadow-sm sm:p-5" role="status">
        <p className="font-display text-lg font-bold text-herbal-900">הרכישה נרשמה</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {result.emailSent
            ? "שלחנו לאימייל קישור גישה לתוכן. אפשר גם לפתוח אותו מכאן:"
            : "לא הצלחנו לשלוח מייל כרגע (שרת הדוא״ל לא מוגדר או נכשל). שמרו את קישור הגישה:"}
        </p>
        <a
          href={result.accessPath}
          className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-herbal-600 px-4 text-sm font-semibold text-white hover:bg-herbal-500"
        >
          פתיחת התוכן
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <p className="text-sm font-semibold text-herbal-900">בחרו איך לשלם · {money(amountNis)}</p>
        <p className="mt-1 text-xs text-slate-500">לחיצה פותחת את האפליקציה או את דף התשלום שהמטפל/ת הגדיר/ה.</p>
      </div>

      <div className="grid gap-2.5">
        {handoffs.map((h) => {
          const selected = picked === h.method;
          return (
            <button
              key={h.method}
              type="button"
              onClick={() => openMethod(h)}
              className={`flex min-h-[56px] w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-right transition sm:min-h-[60px] sm:px-4 ${
                selected
                  ? "border-herbal-600 bg-herbal-50 ring-2 ring-herbal-600/30"
                  : "border-herbal-200 bg-white hover:border-herbal-400 hover:bg-herbal-50/60"
              }`}
            >
              <PaymentMethodLogo method={h.method} className="h-9 w-auto shrink-0 sm:h-10" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-herbal-900">{paymentMethodLabel(h.method)}</span>
                <span className="mt-0.5 block text-xs text-slate-600">
                  {h.usesCustomLink
                    ? "פתיחת קישור התשלום"
                    : h.phone
                      ? `העברה ל-${formatIlPhone(h.phone)}`
                      : "מעבר לתשלום"}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {active?.phone && !active.usesCustomLink ? (
        <p className="text-sm text-slate-700">
          באפליקציה העבירו <span className="font-semibold">{money(active.amountNis)}</span> למספר{" "}
          <span className="font-semibold" dir="ltr">
            {formatIlPhone(active.phone)}
          </span>
        </p>
      ) : null}

      {opened && active ? (
        <form
          className="space-y-3 rounded-2xl border border-herbal-100 bg-white p-4 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setErr(null);
            startTransition(async () => {
              try {
                const res = await registerDigitalProductPurchase({
                  productId,
                  paymentMethod: active.method,
                  buyerName: String(fd.get("name") ?? ""),
                  buyerEmail: String(fd.get("email") ?? ""),
                  buyerPhone: String(fd.get("phone") ?? ""),
                });
                setResult(res);
              } catch (ex) {
                setErr(ex instanceof Error ? ex.message : "שגיאה");
              }
            });
          }}
        >
          <p className="text-sm font-semibold text-herbal-900">אחרי התשלום — השלימו רישום לקבלת גישה</p>
          <p className="text-xs text-slate-500">שם, אימייל וטלפון נדרשים. נשלח קישור גישה לאימייל.</p>
          <label className="block text-xs font-semibold text-slate-700">
            שם מלא
            <input
              name="name"
              required
              minLength={2}
              maxLength={120}
              defaultValue={defaultName || session?.user?.name || ""}
              className="mt-1 min-h-[48px] w-full rounded-xl border border-herbal-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-700">
            אימייל
            <input
              name="email"
              type="email"
              required
              maxLength={191}
              dir="ltr"
              defaultValue={defaultEmail || session?.user?.email || ""}
              className="mt-1 min-h-[48px] w-full rounded-xl border border-herbal-200 px-3 py-2 text-left text-sm"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-700">
            טלפון נייד
            <input
              name="phone"
              type="tel"
              required
              inputMode="tel"
              dir="ltr"
              placeholder="0501234567"
              className="mt-1 min-h-[48px] w-full rounded-xl border border-herbal-200 px-3 py-2 text-left text-sm"
            />
          </label>
          {err ? <p className="text-sm text-rose-600">{err}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="flex min-h-[48px] w-full items-center justify-center rounded-full bg-herbal-600 px-3 text-center text-sm font-semibold leading-snug text-white hover:bg-herbal-500 disabled:opacity-60"
          >
            {pending ? "שומרים…" : "אישור וקבלת גישה"}
          </button>
        </form>
      ) : (
        <p className="text-xs text-slate-500">בחרו אמצעי תשלום כדי להמשיך לטופס הרישום.</p>
      )}
    </div>
  );
}
