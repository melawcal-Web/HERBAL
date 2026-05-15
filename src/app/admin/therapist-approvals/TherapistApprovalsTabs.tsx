"use client";

import { useState } from "react";
import { TherapistVerificationRow, type VerificationRowModel } from "./TherapistVerificationRow";

type Tab = "pending" | "approved" | "rejected";

export function TherapistApprovalsTabs({
  pending,
  approved,
  rejected,
}: {
  pending: VerificationRowModel[];
  approved: VerificationRowModel[];
  rejected: VerificationRowModel[];
}) {
  const [tab, setTab] = useState<Tab>("pending");

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "pending", label: "ממתינים לאישור", count: pending.length },
    { id: "approved", label: "מאושרים", count: approved.length },
    { id: "rejected", label: "נדחו / בוטל", count: rejected.length },
  ];

  const rows = tab === "pending" ? pending : tab === "approved" ? approved : rejected;
  const mode = tab === "pending" ? "pending" : tab === "approved" ? "approved" : "rejected";

  return (
    <div>
      <div className="mt-8 flex flex-wrap gap-2 border-b border-herbal-100 pb-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === t.id
                ? "bg-herbal-600 text-white"
                : "bg-herbal-50 text-herbal-800 hover:bg-herbal-100"
            }`}
          >
            {t.label}
            {t.count > 0 ? <span className="ms-1.5 opacity-80">({t.count})</span> : null}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600">אין רשומות בלשונית זו.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-herbal-100 bg-white/90 shadow-sm">
          <table className="w-full min-w-[640px] text-right text-sm">
            <thead>
              <tr className="border-b border-herbal-100 bg-herbal-50/80 text-xs uppercase tracking-wide text-slate-600">
                <th className="px-4 py-3 font-semibold">שם</th>
                <th className="px-4 py-3 font-semibold">אימייל</th>
                <th className="px-4 py-3 font-semibold">תעודה</th>
                <th className="px-4 py-3 font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-herbal-100">
              {rows.map((r) => (
                <TherapistVerificationRow key={r.id} row={r} mode={mode} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
