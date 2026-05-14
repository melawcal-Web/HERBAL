"use client";

import { useState, useTransition } from "react";
import { approveTherapistCertificate, rejectTherapistCertificate, revokeTherapistApproval } from "@/app/actions/admin-users";

export type VerificationRowModel = {
  id: string;
  name: string;
  email: string;
  certificateUrl: string | null;
  therapistVerification: "pending_approval" | "approved" | "rejected" | "none";
};

export function TherapistVerificationRow({
  row,
  mode,
}: {
  row: VerificationRowModel;
  mode: "pending" | "approved" | "rejected";
}) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function run(fn: () => Promise<void>) {
    setErr(null);
    start(() => {
      void (async () => {
        try {
          await fn();
        } catch (e) {
          setErr(e instanceof Error ? e.message : "שגיאה");
        }
      })();
    });
  }

  return (
    <tr className="align-top hover:bg-herbal-50/40">
      <td className="px-4 py-3 font-medium text-herbal-900">{row.name}</td>
      <td className="px-4 py-3 font-mono text-xs text-slate-700" dir="ltr">
        {row.email}
      </td>
      <td className="max-w-[14rem] px-4 py-3">
        {row.certificateUrl ? (
          <a
            href={row.certificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-sm text-herbal-800 underline underline-offset-2"
            dir="ltr"
          >
            צפייה בתעודה
          </a>
        ) : (
          <span className="text-xs text-slate-500">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {mode === "pending" || mode === "rejected" ? (
            <>
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => approveTherapistCertificate(row.id))}
                className="rounded-lg bg-herbal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-herbal-500 disabled:opacity-50"
              >
                אישור
              </button>
              {mode === "pending" ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => rejectTherapistCertificate(row.id))}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-900 hover:bg-rose-100 disabled:opacity-50"
                >
                  דחייה
                </button>
              ) : null}
            </>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => revokeTherapistApproval(row.id))}
              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-100 disabled:opacity-50"
            >
              שלילת אישור
            </button>
          )}
        </div>
        {err ? <p className="mt-2 text-xs text-rose-600">{err}</p> : null}
      </td>
    </tr>
  );
}
