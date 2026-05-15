"use client";

import { useMemo, useState, useTransition } from "react";
import { requestAppointment } from "@/app/actions/appointments";
import { AppointmentWeekDiary } from "@/components/calendar/AppointmentWeekDiary";
import type { HourSlot, WeeklyAvailability } from "@/lib/therapist-availability";

type Props = {
  therapistUserId: string;
  therapistProfileId: string;
  availability: WeeklyAvailability;
  openUntil?: Date | null;
  booked?: { start: Date; end: Date }[];
};

export function TherapistAppointmentCalendar({
  therapistUserId,
  therapistProfileId,
  availability,
  openUntil,
  booked = [],
}: Props) {
  const hasAvailability = useMemo(() => Object.keys(availability).length > 0, [availability]);
  const [selected, setSelected] = useState<HourSlot | null>(null);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (!hasAvailability) return null;

  return (
    <section className="mt-14 border-t border-neutral-200/90 pt-12" aria-labelledby="calendar-heading">
      <p id="calendar-heading" className="text-[11px] font-bold uppercase tracking-[0.36em] text-herbal-800/80">
        תיאום פגישה
      </p>
      <p className="mt-2 text-sm text-slate-600">
        בחרו מועד פנוי מהיומן (שעה אחת) ושלחו בקשה — ממתין לאישור המטפל/ת.
        {openUntil ? (
          <span className="block text-xs text-slate-500">
            פתוח להזמנות עד {openUntil.toLocaleDateString("he-IL")}
          </span>
        ) : null}
      </p>

      <div className="mt-4">
        <AppointmentWeekDiary
          availability={availability}
          openUntil={openUntil}
          booked={booked}
          selected={selected}
          onSelect={setSelected}
        />
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
                  slotStart: selected.start.toISOString(),
                  slotEnd: selected.end.toISOString(),
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
          <p className="text-sm font-semibold text-herbal-900">
            בקשת פגישה ·{" "}
            {selected.start.toLocaleString("he-IL", {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
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
