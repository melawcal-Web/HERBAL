"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import type { ContentKind, PriceCategory } from "@prisma/client";
import { requestManualAccess } from "@/app/actions/commerce";

export function ManualAccessRequestButton({
  therapistId,
  contentKind,
  contentId,
  contentTitle,
  priceCategory,
  amountNis,
}: {
  therapistId: string;
  contentKind: ContentKind;
  contentId: string;
  contentTitle: string;
  priceCategory: PriceCategory;
  amountNis: number;
}) {
  const { data: session } = useSession();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (!session?.user) {
    return (
      <p className="mt-3 text-xs text-slate-600">
        לתשלום ביט/העברה —{" "}
        <a href="/auth/signin" className="font-semibold text-herbal-700 underline">
          התחברו עם Google
        </a>{" "}
        ולאחר מכן שלחו בקשת גישה.
      </p>
    );
  }

  return (
    <div className="mt-4 border-t border-herbal-50 pt-4">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-full border border-herbal-400 bg-herbal-50 py-2.5 text-sm font-semibold text-herbal-900 hover:bg-herbal-100"
        >
          בקשת גישה לאחר תשלום (ביט / העברה)
        </button>
      ) : (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            setErr(null);
            setMsg(null);
            startTransition(async () => {
              try {
                await requestManualAccess({
                  therapistId,
                  contentKind,
                  contentId,
                  contentTitle,
                  priceCategory,
                  amountNis,
                  paymentNote: note,
                  guestEmail: session.user?.email ?? "",
                  guestName: session.user?.name ?? undefined,
                });
                setMsg("הבקשה נשלחה למטפל/ת לאישור.");
                setOpen(false);
              } catch (ex) {
                setErr(ex instanceof Error ? ex.message : "שגיאה");
              }
            });
          }}
        >
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="פרטי תשלום (אופציונלי) — מספר אסמכתא, תאריך…"
            className="w-full rounded-lg border border-herbal-200 px-3 py-2 text-sm"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-full bg-herbal-600 py-2 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-60"
            >
              {pending ? "שולח…" : "שליחת בקשה"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-herbal-200 px-4 py-2 text-sm text-slate-600"
            >
              ביטול
            </button>
          </div>
        </form>
      )}
      {msg ? <p className="mt-2 text-xs text-herbal-700">{msg}</p> : null}
      {err ? <p className="mt-2 text-xs text-rose-600">{err}</p> : null}
    </div>
  );
}
