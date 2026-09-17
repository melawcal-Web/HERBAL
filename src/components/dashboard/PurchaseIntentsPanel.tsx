"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  confirmDigitalPurchasePaidForTherapist,
  markDigitalPurchaseUnpaidForTherapist,
  type PendingDigitalIntentRow,
} from "@/app/actions/digital-purchase";
import { paymentMethodLabel, type TherapistPaymentMethodId } from "@/lib/therapist-payments";

function methodLabel(raw: string) {
  if (raw === "bit" || raw === "paybox" || raw === "grow") {
    return paymentMethodLabel(raw as TherapistPaymentMethodId);
  }
  return raw || "—";
}

export function PurchaseIntentsPanel({ initial }: { initial: PendingDigitalIntentRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (initial.length === 0) {
    return <p className="text-sm text-slate-600">אין כוונות רכישה ממתינות לאישור תשלום.</p>;
  }

  return (
    <div className="space-y-4">
      {initial.map((row) => (
        <article key={row.id} className="rounded-2xl border border-herbal-100 bg-white p-4 shadow-sm">
          <p className="font-semibold text-herbal-900">{row.contentTitle}</p>
          <p className="mt-1 text-sm text-slate-600">
            {row.buyerName} · {row.buyerEmail}
            {row.buyerPhone ? ` · ${row.buyerPhone}` : ""} · {methodLabel(row.paymentMethod)} · ₪{row.amountNis}
          </p>
          <p className="mt-1 text-xs text-slate-500" dir="ltr">
            {new Date(row.createdAt).toLocaleString("he-IL")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await confirmDigitalPurchasePaidForTherapist(row.id);
                  router.refresh();
                })
              }
              className="min-h-[44px] rounded-full bg-herbal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-60"
            >
              אישור תשלום וגישה
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await markDigitalPurchaseUnpaidForTherapist(row.id);
                  router.refresh();
                })
              }
              className="min-h-[44px] rounded-full border border-rose-200 px-5 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
            >
              התשלום לא התקבל
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
