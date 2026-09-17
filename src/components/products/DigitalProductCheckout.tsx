"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createDigitalPurchaseIntent } from "@/app/actions/digital-purchase";
import { PaymentMethodLogo } from "@/components/products/PaymentMethodLogo";
import { buyerAccountProfileHref, digitalPurchaseBlockedMessage } from "@/lib/buyer-profile";
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
  signedIn,
  profileComplete,
  blocked,
  callbackPath,
}: {
  productId: string;
  amountNis: number;
  handoffs: PaymentHandoff[];
  signedIn: boolean;
  profileComplete: boolean;
  blocked: boolean;
  callbackPath: string;
}) {
  const [picked, setPicked] = useState<TherapistPaymentMethodId | null>(null);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<{ therapistEmailSent: boolean; alreadyPaidAccessPath: string | null } | null>(
    null,
  );

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

  if (!signedIn) {
    const encoded = encodeURIComponent(callbackPath);
    return (
      <div className="rounded-2xl border border-herbal-200 bg-white p-4 shadow-sm sm:p-5" role="status">
        <p className="font-semibold text-herbal-900">רכישה למחוברים בלבד</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          יש להתחבר או להירשם. אחרי הכניסה תחזרו לדף המוצר. הרכישה משתמשת בשם, אימייל וטלפון מהפרופיל — בלי טופס
          אורח.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row-reverse">
          <Link
            href={`/auth/register?callbackUrl=${encoded}`}
            className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-herbal-600 px-4 text-sm font-semibold text-white hover:bg-herbal-500"
          >
            הרשמה
          </Link>
          <Link
            href={`/auth/signin?callbackUrl=${encoded}`}
            className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-herbal-200 px-4 text-sm font-semibold text-herbal-900 hover:bg-herbal-50"
          >
            כניסה
          </Link>
        </div>
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-5 text-sm leading-relaxed text-rose-900" role="status">
        <p className="font-semibold">לא ניתן לרכוש כרגע</p>
        <p className="mt-2">{digitalPurchaseBlockedMessage()}</p>
      </div>
    );
  }

  if (!profileComplete) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-5 text-sm leading-relaxed text-slate-700" role="status">
        <p className="font-semibold text-herbal-900">יש להשלים את פרטי החשבון</p>
        <p className="mt-2">רכישה דורשת שם, אימייל וטלפון נייד בפרופיל. אין טופס נפרד בקופה.</p>
        <Link
          href={buyerAccountProfileHref(callbackPath)}
          className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-herbal-600 px-4 text-sm font-semibold text-white hover:bg-herbal-500"
        >
          השלמת פרופיל
        </Link>
      </div>
    );
  }

  if (done?.alreadyPaidAccessPath) {
    return (
      <div className="rounded-2xl border border-herbal-200 bg-white p-4 shadow-sm" role="status">
        <p className="font-semibold text-herbal-900">כבר יש לכם גישה לתוכן זה</p>
        <a
          href={done.alreadyPaidAccessPath}
          className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-herbal-600 px-4 text-sm font-semibold text-white hover:bg-herbal-500"
        >
          פתיחת התוכן
        </a>
      </div>
    );
  }

  if (done) {
    const active = picked ? handoffs.find((h) => h.method === picked) : null;
    return (
      <div className="rounded-2xl border border-herbal-200 bg-white p-4 shadow-sm sm:p-5" role="status">
        <p className="font-display text-lg font-bold text-herbal-900">כוונת התשלום נרשמה</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {done.therapistEmailSent
            ? "נשלחה הודעה למטפל/ת עם פרטי החשבון שלכם ואמצעי התשלום."
            : "רשמנו את הכוונה במערכת. שליחת המייל למטפל/ת דלגה (אין Resend מוגדר) — המטפל/ת יראה/תראה אותה בלוח האישורים."}
          {" "}
          הגישה לתוכן תיפתח רק אחרי אישור שהתשלום התקבל.
        </p>
        {active?.phone && !active.usesCustomLink ? (
          <p className="mt-3 text-sm text-slate-700">
            באפליקציה העבירו <span className="font-semibold">{money(active.amountNis)}</span> למספר{" "}
            <span className="font-semibold" dir="ltr">
              {formatIlPhone(active.phone)}
            </span>
          </p>
        ) : null}
      </div>
    );
  }

  function chooseMethod(h: PaymentHandoff) {
    setErr(null);
    setPicked(h.method);
    startTransition(async () => {
      try {
        const res = await createDigitalPurchaseIntent({ productId, paymentMethod: h.method });
        window.open(h.href, "_blank", "noopener,noreferrer");
        setDone(res);
      } catch (ex) {
        setErr(ex instanceof Error ? ex.message : "שגיאה");
      }
    });
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <p className="text-sm font-semibold text-herbal-900">בחרו איך לשלם · {money(amountNis)}</p>
        <p className="mt-1 text-xs text-slate-500">
          לחיצה רושמת כוונת רכישה (מהפרופיל שלכם) ופותחת את אמצעי התשלום. הגישה תינתן אחרי אישור המטפל/ת.
        </p>
      </div>

      <div className="grid gap-2.5">
        {handoffs.map((h) => {
          const selected = picked === h.method;
          return (
            <button
              key={h.method}
              type="button"
              disabled={pending}
              onClick={() => chooseMethod(h)}
              className={`flex min-h-[56px] w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-right transition sm:min-h-[60px] sm:px-4 disabled:opacity-60 ${
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
      {pending ? <p className="text-xs text-herbal-800">רושמים כוונת תשלום…</p> : null}
      {err ? <p className="text-sm text-rose-600">{err}</p> : null}
    </div>
  );
}
