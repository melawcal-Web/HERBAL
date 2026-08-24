"use client";

import { useState, useTransition } from "react";
import { pushToLive } from "@/app/actions/admin-deploy";

export function DeployToLiveButton() {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function onClick() {
    const ok = window.confirm("אוקיי לדחוף לאוויר?\n\nיידחף ה-commit הנוכחי ל-GitHub (origin) ו-Railway יפרוס מ-main.");
    if (!ok) return;

    setMsg(null);
    setErr(null);
    startTransition(() => {
      void (async () => {
        const result = await pushToLive();
        if (result.ok) setMsg(result.message);
        else setErr(result.message);
      })();
    });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="min-h-[48px] rounded-full bg-herbal-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-herbal-600/25 hover:bg-herbal-500 disabled:opacity-50"
      >
        {pending ? "דוחפים לאוויר…" : "העלה לאוויר"}
      </button>
      {msg ? (
        <pre className="whitespace-pre-wrap rounded-xl border border-herbal-200 bg-herbal-50/60 p-4 text-left text-xs leading-relaxed text-herbal-900" dir="ltr">
          {msg}
        </pre>
      ) : null}
      {err ? (
        <pre className="whitespace-pre-wrap rounded-xl border border-rose-200 bg-rose-50 p-4 text-left text-xs leading-relaxed text-rose-800" dir="ltr">
          {err}
        </pre>
      ) : null}
    </div>
  );
}
