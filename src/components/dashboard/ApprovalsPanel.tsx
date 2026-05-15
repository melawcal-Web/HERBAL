"use client";

import { useTransition } from "react";
import { approveManualAccess, rejectManualAccess } from "@/app/actions/commerce";
import { contentKindLabel, priceCategoryLabel } from "@/lib/commerce";
import type { ManualAccessRequest, PriceCategory } from "@prisma/client";

type Row = ManualAccessRequest & {
  client: { name: string; email: string; image: string | null } | null;
};

export function ApprovalsPanel({ initial }: { initial: Row[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      {initial.length === 0 ? (
        <p className="text-sm text-slate-600">אין בקשות ממתינות לאישור תשלום (ביט/העברה).</p>
      ) : (
        initial.map((req) => (
          <article key={req.id} className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 shadow-sm">
            <p className="font-semibold text-herbal-900">{req.contentTitle}</p>
            <p className="mt-1 text-sm text-slate-600">
              {req.client?.name ?? req.guestName ?? req.guestEmail} · {contentKindLabel(req.contentKind)} ·{" "}
              {priceCategoryLabel(req.priceCategory as PriceCategory)} · ₪{Number(req.amountNis)}
            </p>
            {req.paymentNote ? <p className="mt-2 text-xs text-slate-600">הערה: {req.paymentNote}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await approveManualAccess(req.id);
                  })
                }
                className="rounded-full bg-herbal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-60"
              >
                אשר גישה
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await rejectManualAccess(req.id);
                  })
                }
                className="rounded-full border border-rose-200 px-5 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
              >
                דחייה
              </button>
            </div>
          </article>
        ))
      )}
    </div>
  );
}