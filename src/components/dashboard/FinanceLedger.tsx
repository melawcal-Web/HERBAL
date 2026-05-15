"use client";

import { priceCategoryLabel } from "@/lib/commerce";
import type { FinanceLedgerRow } from "@/app/actions/commerce";

export function FinanceLedger({
  rows,
  totalCommissionOwed,
}: {
  rows: FinanceLedgerRow[];
  totalCommissionOwed: number;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-herbal-200 bg-herbal-50/80 p-5">
        <p className="text-sm font-medium text-herbal-800">סה״כ עמלה חייבת למרכז (15% ממחיר מלא בלבד)</p>
        <p className="mt-1 font-display text-3xl font-bold text-herbal-900">
          ₪{totalCommissionOwed.toLocaleString("he-IL", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-herbal-100 bg-white shadow-sm">
        <table className="min-w-full text-right text-sm">
          <thead className="border-b border-herbal-100 bg-herbal-50/60 text-xs font-bold uppercase tracking-wide text-herbal-800">
            <tr>
              <th className="px-4 py-3">משתמש/ת</th>
              <th className="px-4 py-3">תוכן</th>
              <th className="px-4 py-3">מחירון</th>
              <th className="px-4 py-3">סכום</th>
              <th className="px-4 py-3">עמלה למרכז</th>
              <th className="px-4 py-3">תאריך</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-600">
                  אין תנועות עדיין — כולל רישום חינם/חבר (₪0).
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-herbal-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-herbal-900">{r.userName}</td>
                  <td className="px-4 py-3 text-slate-700">{r.contentTitle}</td>
                  <td className="px-4 py-3">{priceCategoryLabel(r.priceCategory)}</td>
                  <td className="px-4 py-3">₪{r.amountNis}</td>
                  <td className="px-4 py-3">₪{r.commissionNis}</td>
                  <td className="px-4 py-3 text-slate-600" dir="ltr">
                    {new Date(r.createdAt).toLocaleString("he-IL")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
