"use client";

import { useState, useTransition } from "react";
import { duplicateTherapistProfile } from "@/app/actions/admin-users";

export function DuplicateTherapistButton({ userId, userName }: { userId: string; userName: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="mt-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setErr(null);
          setMsg(null);
          if (!window.confirm(`לשכפל את פרופיל ${userName}?`)) return;
          start(() => {
            void (async () => {
              try {
                const r = await duplicateTherapistProfile(userId);
                setMsg(`נוצר עותק — ${r.email}`);
              } catch (e) {
                setErr(e instanceof Error ? e.message : "שגיאה");
              }
            })();
          });
        }}
        className="rounded-lg border border-herbal-300 bg-white px-2 py-1 text-[11px] font-semibold text-herbal-800 hover:bg-herbal-50 disabled:opacity-50"
      >
        שכפול מטפל
      </button>
      {msg ? <p className="mt-1 text-[10px] text-herbal-700" dir="ltr">{msg}</p> : null}
      {err ? <p className="mt-1 text-[10px] text-rose-600">{err}</p> : null}
    </div>
  );
}
