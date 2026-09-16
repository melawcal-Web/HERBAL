"use client";

import { useState } from "react";
import { ManualAccessRequestButton } from "@/components/products/ManualAccessRequestButton";
import {
  buildPaymentHandoff,
  enabledPaymentMethods,
  paymentMethodLabel,
  type TherapistPaymentMethodId,
  type TherapistPaymentSettings,
} from "@/lib/therapist-payments";
import type { ContentKind, PriceCategory } from "@prisma/client";

function money(n: number) {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(n);
}

export function ProductPaymentHandoff({
  therapistId,
  contentKind,
  contentId,
  contentTitle,
  amountNis,
  paymentSettings,
  compact = false,
}: {
  therapistId: string;
  contentKind: ContentKind;
  contentId: string;
  contentTitle: string;
  amountNis: number;
  paymentSettings: TherapistPaymentSettings;
  compact?: boolean;
}) {
  const methods = enabledPaymentMethods(paymentSettings);
  const [picked, setPicked] = useState<TherapistPaymentMethodId | null>(methods[0] ?? null);
  const [opened, setOpened] = useState(false);

  if (methods.length === 0) {
    return (
      <ManualAccessRequestButton
        therapistId={therapistId}
        contentKind={contentKind}
        contentId={contentId}
        contentTitle={contentTitle}
        priceCategory={"regular" as PriceCategory}
        amountNis={amountNis}
        compact={compact}
      />
    );
  }

  const cfg = picked ? paymentSettings[picked] : null;
  const handoff =
    picked && cfg
      ? buildPaymentHandoff(picked, cfg, { amountNis, description: contentTitle })
      : null;

  function openHandoff() {
    if (!handoff) return;
    window.open(handoff.href, "_blank", "noopener,noreferrer");
    setOpened(true);
  }

  return (
    <div className={compact ? "mt-2 space-y-2" : "mt-4 space-y-3 border-t border-herbal-50 pt-4"}>
      <p className={`font-semibold text-herbal-900 ${compact ? "text-xs" : "text-sm"}`}>בחרו איך לשלם למטפל/ת</p>
      <div className={`flex ${compact ? "gap-1.5" : "gap-2"}`}>
        {methods.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setPicked(id);
              const next = buildPaymentHandoff(id, paymentSettings[id], {
                amountNis,
                description: contentTitle,
              });
              if (next) {
                window.open(next.href, "_blank", "noopener,noreferrer");
                setOpened(true);
              }
            }}
            className={`flex-1 rounded-full border text-center font-semibold transition ${
              compact ? "px-2 py-1.5 text-[11px]" : "px-3 py-2 text-sm"
            } ${
              picked === id
                ? "border-herbal-600 bg-herbal-600 text-white"
                : "border-herbal-200 bg-white text-herbal-800 hover:border-herbal-400 hover:bg-herbal-50"
            }`}
          >
            {paymentMethodLabel(id)}
          </button>
        ))}
      </div>

      {handoff ? (
        <>
          {!compact ? (
            <button
              type="button"
              onClick={openHandoff}
              className="w-full rounded-full bg-herbal-600 py-2.5 text-sm font-semibold text-white hover:bg-herbal-500"
            >
              {`לתשלום ${money(amountNis)} ב-${paymentMethodLabel(handoff.method)}`}
            </button>
          ) : null}
          {handoff.phone ? (
            <p className={`text-slate-600 ${compact ? "text-[10px] leading-snug" : "text-xs"}`} dir="ltr">
              {handoff.phone}
              {` · ${money(handoff.amountNis)}`}
            </p>
          ) : null}
          {opened ? (
            <p className={`text-herbal-800 ${compact ? "text-[10px]" : "text-xs"}`}>
              האפליקציה נפתחה. אחרי התשלום — שלחו בקשת גישה.
            </p>
          ) : null}
        </>
      ) : (
        <p className="text-xs text-rose-600">חסר מספר או קישור לאמצעי שנבחר.</p>
      )}

      <ManualAccessRequestButton
        therapistId={therapistId}
        contentKind={contentKind}
        contentId={contentId}
        contentTitle={contentTitle}
        priceCategory={"regular" as PriceCategory}
        amountNis={amountNis}
        compact={compact}
      />
    </div>
  );
}
