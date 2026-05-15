"use client";

import { useMemo, useState, useTransition } from "react";
import { requestAppointment } from "@/app/actions/appointments";
import { buildOpenSlots, dayLabel } from "@/lib/therapist-availability";
import type { WeeklyAvailability } from "@/lib/therapist-availability";

type Props = {
  therapistUserId: string;
  therapistProfileId: string;
  availability: WeeklyAvailability;
};

export function TherapistAppointmentCalendar({ therapistUserId, therapistProfileId, availability }: Props) {
  const slots = useMemo(() => buildOpenSlots(availability, 3, 30), [availability]);
  const [selected, setSelected] = useState<{ start: string; end: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (slots.length === 0) return null;

  return (
    <section className="mt-14 border-t border-neutral-200/90 pt-12" aria-labelledby="calendar-heading">
      <p id="calendar-heading" className="text-[11px] font-bold uppercase tracking-[0.36em] text-herbal-800/80">
        תיאום פגישה
      </p>
      <p className="mt-2 text-sm text-slate-600">בחרו מועד פנוי ושלחו בקשה — הסטטוס: ממתין לאישור המטפל/ת.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {slots.slice(0, 24).map((s) => {
          const key = s.start.toISOString();
          const label = `${dayLabel(s.start.getDay())} · ${s.start.toLocaleString("he-IL", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}`;
          const on = selected?.start === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected({ start: key, end: s.end.toISOString() })}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                on
                  ? "border-herbal-600 bg-herbal-600 text-white"
                  : "border-herbal-200 bg-white text-herbal-800 hover:border-herbal-400"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {selected ? (
        <form
          className="mt-6 max-w-md space-y-3 rounded-2xl border border-herbal-100 bg-herbal-50/40 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            setErr(null);
            setMsg(null);
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              try {
                await requestAppointment({
                  therapistUserId,
                  therapistProfileId,
                  slotStart: selected.start,
                  slotEnd: selected.end,
                  guestName: String(fd.get("name") ?? ""),
                  guestEmail: String(fd.get("email") ?? ""),
                  guestPhone: String(fd.get("phone") ?? "") || undefined,
                  note: String(fd.get("note") ?? "") || undefined,
                });
                setMsg("הבקשה נשלחה — ממתין לאישור.");
                setSelected(null);
                e.currentTarget.reset();
              } catch (ex) {
                setErr(ex instanceof Error ? ex.message : "שגיאה");
              }
            });
          }}
        >
          <p className="text-sm font-semibold text-herbal-900">בקשת פגישה</p>
          <input name="name" required placeholder="שם" className="w-full rounded-lg border border-herbal-200 px-3 py-2 text-sm" />
          <input
            name="email"
            type="email"
            required
            placeholder="אימייל"
            className="w-full rounded-lg border border-herbal-200 px-3 py-2 text-sm"
            dir="ltr"
          />
          <input name="phone" placeholder="טלפון (אופציונלי)" className="w-full rounded-lg border border-herbal-200 px-3 py-2 text-sm" />
          <textarea name="note" rows={2} placeholder="הערה" className="w-full rounded-lg border border-herbal-200 px-3 py-2 text-sm" />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-herbal-600 py-2.5 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-60"
          >
            {pending ? "שולח…" : "בקשת פגישה"}
          </button>
          {msg ? <p className="text-xs text-herbal-700">{msg}</p> : null}
          {err ? <p className="text-xs text-rose-600">{err}</p> : null}
        </form>
      ) : null}
    </section>
  );
}
