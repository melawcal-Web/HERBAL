"use client";

import { contentKindLabel, priceCategoryLabel } from "@/lib/commerce";
import type { ViewReportRow } from "@/app/actions/commerce";

export function ViewReportTable({ rows }: { rows: ViewReportRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-600">אין רשומות עדיין — צפיות ורכישות יופיעו כאן.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-herbal-100 bg-white shadow-sm">
      <table className="min-w-full text-right text-sm">
        <thead className="border-b border-herbal-100 bg-herbal-50/60 text-xs font-bold uppercase tracking-wide text-herbal-800">
          <tr>
            <th className="px-4 py-3">שם משתמש/ת</th>
            <th className="px-4 py-3">תוכן</th>
            <th className="px-4 py-3">סוג</th>
            <th className="px-4 py-3">תאריך</th>
            <th className="px-4 py-3">מחירון</th>
            <th className="px-4 py-3">אירוע</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-herbal-50 last:border-0">
              <td className="px-4 py-3 font-medium text-herbal-900">{r.userName}</td>
              <td className="px-4 py-3 text-slate-700">{r.contentName}</td>
              <td className="px-4 py-3 text-slate-600">{contentKindLabel(r.contentKind)}</td>
              <td className="px-4 py-3 text-slate-600" dir="ltr">
                {new Date(r.accessedAt).toLocaleString("he-IL")}
              </td>
              <td className="px-4 py-3">{priceCategoryLabel(r.priceCategory)}</td>
              <td className="px-4 py-3 text-slate-600">{r.eventType === "view" ? "צפייה" : "רכישה/הרשמה"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
