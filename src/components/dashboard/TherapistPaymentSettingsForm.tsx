"use client";

import { useMemo, useState, useTransition } from "react";
import { updateTherapistPaymentSettings } from "@/app/actions/therapist-payments";
import {
  emptyTherapistPaymentSettings,
  type TherapistPaymentMethodConfig,
  type TherapistPaymentMethodId,
  type TherapistPaymentSettings,
} from "@/lib/therapist-payments";

const METHODS: { id: TherapistPaymentMethodId; title: string; hint: string }[] = [
  {
    id: "bit",
    title: "Bit",
    hint: "מספר הנייד המחובר לביט, ו/או קישור לבקשת תשלום שיצרתם באפליקציה.",
  },
  {
    id: "paybox",
    title: "PayBox",
    hint: "מספר הנייד ב-PayBox, ו/או קישור לבקשת תשלום / קבוצה שהעתקתם מהאפליקציה.",
  },
];

function fieldClass() {
  return "mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2";
}

export function TherapistPaymentSettingsForm({ initial }: { initial?: TherapistPaymentSettings | null }) {
  const [form, setForm] = useState<TherapistPaymentSettings>(initial ?? emptyTherapistPaymentSettings());
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const snapshot = useMemo(() => JSON.stringify(initial ?? emptyTherapistPaymentSettings()), [initial]);
  const dirty = JSON.stringify(form) !== snapshot;

  function patch(id: TherapistPaymentMethodId, patchValue: Partial<TherapistPaymentMethodConfig>) {
    setForm((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patchValue },
    }));
    setOk(false);
  }

  return (
    <form
      className="space-y-4"
      dir="rtl"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setOk(false);
        startTransition(async () => {
          try {
            await updateTherapistPaymentSettings(form);
            setOk(true);
          } catch (err) {
            setError(err instanceof Error ? err.message : "שגיאה");
          }
        });
      }}
    >
      <p className="text-sm leading-relaxed text-slate-600">
        הלקוח בוחר אמצעי תשלום בעמוד המוצר ונפתח Bit או PayBox לתשלום אליכם. קישור בקשת תשלום מהאפליקציה
        מומלץ כשיש סכום קבוע; מספר נייד מספיק להעברה ידנית. חיבור API מלא (סליקה) ניתן להוסיף מאוחר יותר בלי
        לשנות את מבנה השדות.
      </p>

      {METHODS.map((m) => {
        const cfg = form[m.id];
        return (
          <fieldset key={m.id} className="rounded-2xl border border-herbal-200/80 bg-white/80 p-4">
            <legend className="text-sm font-medium text-herbal-900">{m.title}</legend>
            <label className="mt-2 flex min-h-[44px] cursor-pointer items-center gap-3 text-sm font-medium text-herbal-900">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-herbal-300 text-herbal-700"
                checked={cfg.enabled}
                onChange={(e) => patch(m.id, { enabled: e.target.checked })}
              />
              לאפשר תשלום ב-{m.title} בדף המוצר
            </label>
            <p className="mt-1 text-xs text-slate-500">{m.hint}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">מספר נייד</label>
                <input
                  className={fieldClass()}
                  dir="ltr"
                  inputMode="tel"
                  placeholder="0501234567"
                  value={cfg.phone}
                  onChange={(e) => patch(m.id, { phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">קישור בקשת תשלום (אופציונלי)</label>
                <input
                  className={fieldClass()}
                  dir="ltr"
                  placeholder="https://"
                  value={cfg.paymentLink}
                  onChange={(e) => patch(m.id, { paymentLink: e.target.value })}
                />
              </div>
            </div>
          </fieldset>
        );
      })}

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {ok ? <p className="text-sm text-herbal-700">פרטי התשלום נשמרו.</p> : null}

      <button
        type="submit"
        disabled={pending || !dirty}
        className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 font-medium text-white hover:bg-herbal-500 disabled:opacity-50"
      >
        {pending ? "שומרים…" : "שמירת אמצעי תשלום"}
      </button>
    </form>
  );
}
