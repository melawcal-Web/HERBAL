"use client";

import { useMemo, useState, useTransition } from "react";
import {
  getTherapistAppointmentsForDashboard,
  saveTherapistScheduleSettings,
  setAppointmentRecurringWeekly,
} from "@/app/actions/appointments";
import { TherapistDashboardMonthCalendar } from "@/components/dashboard/TherapistDashboardMonthCalendar";
import type { WeeklyAvailability } from "@/lib/therapist-availability";
import type { CalendarSlotDefinition } from "@/lib/calendar-slot-definitions";

type ApptRow = {
  id: string;
  guestName: string;
  guestEmail: string;
  slotStart: string;
  slotEnd: string;
  status: string;
  recurringWeekly: boolean;
  kind: "time_slot" | "open_inquiry";
};

type Props = {
  initialAvailability: WeeklyAvailability;
  initialDefinitions: CalendarSlotDefinition[];
  initialAppointments: ApptRow[];
};

export function TherapistSchedulePanel({
  initialAvailability,
  initialDefinitions,
  initialAppointments,
}: Props) {
  const [weeklyFallback] = useState<WeeklyAvailability>(initialAvailability);
  const [definitions, setDefinitions] = useState<CalendarSlotDefinition[]>(initialDefinitions);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const [newDate, setNewDate] = useState("");
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("10:00");
  const [newRepeat, setNewRepeat] = useState(false);
  const [newOccurrences, setNewOccurrences] = useState(4);

  const booked = useMemo(
    () =>
      appointments
        .filter((a) => a.status !== "cancelled" && a.status !== "rejected" && a.kind === "time_slot")
        .map((a) => ({ start: new Date(a.slotStart), end: new Date(a.slotEnd) })),
    [appointments],
  );

  const addDefinition = () => {
    if (!newDate) {
      setMsg("בחרו תאריך.");
      return;
    }
    const start = new Date(`${newDate}T${newStart}:00`);
    const end = new Date(`${newDate}T${newEnd}:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      setMsg("שעות לא תקינות.");
      return;
    }
    const occ = newRepeat ? Math.min(52, Math.max(1, newOccurrences)) : 1;
    setDefinitions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        startISO: start.toISOString(),
        endISO: end.toISOString(),
        repeatWeekly: newRepeat,
        occurrences: occ,
      },
    ]);
    setMsg(null);
  };

  const removeDefinition = (id: string) => {
    setDefinitions((prev) => prev.filter((d) => d.id !== id));
  };

  const saveSettings = () => {
    startTransition(async () => {
      await saveTherapistScheduleSettings({
        definitions,
        weeklyFallback,
      });
      setMsg("הגדרות היומן נשמרו.");
    });
  };

  const toggleRecurring = (id: string, value: boolean) => {
    startTransition(async () => {
      await setAppointmentRecurringWeekly(id, value);
      const fresh = await getTherapistAppointmentsForDashboard();
      setAppointments(fresh);
    });
  };

  const fmtDef = (d: CalendarSlotDefinition) => {
    const s = new Date(d.startISO);
    const e = new Date(d.endISO);
    const day = s.toLocaleDateString("he-IL", { weekday: "short", day: "numeric", month: "short" });
    const ts = s.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
    const te = e.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
    return `${day} · ${ts}–${te}${d.repeatWeekly ? ` · חוזר ${d.occurrences} שבועות` : ""}`;
  };

  return (
    <section className="mt-10 space-y-8 rounded-2xl border border-herbal-100 bg-white p-5 shadow-sm">
      <div>
        <h2 className="font-display text-lg font-bold text-herbal-900">יומן וזמינות</h2>
        <p className="mt-1 text-sm text-slate-600">
          נקודות ביומן מופיעות רק כשיש משמעות: <strong className="font-semibold text-sky-700">כחול</strong> — חלון פנוי
          בפועל; <strong className="font-semibold text-rose-700">אדום</strong> — תור או בקשה. לחיצה על יום פותחת פירוט.
          להלן הוספת חלונות לפי תאריך ושעה, חזרה שבועית ומספר מופעים.
        </p>

        <div className="mt-4">
          <TherapistDashboardMonthCalendar
            weeklyAvailability={weeklyFallback}
            definitions={definitions}
            bookedBlocks={booked}
            appointments={appointments}
          />
        </div>

        <p className="mt-6 text-sm font-semibold text-herbal-900">הוספת זמינות</p>
        <div className="mt-3 grid gap-3 rounded-xl border border-herbal-50 bg-herbal-50/30 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
            תאריך
            <input
              type="date"
              className="rounded-lg border border-herbal-200 px-2 py-2 text-sm"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
            שעת התחלה
            <input
              type="time"
              className="rounded-lg border border-herbal-200 px-2 py-2 text-sm"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
            שעת סיום
            <input
              type="time"
              className="rounded-lg border border-herbal-200 px-2 py-2 text-sm"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
            />
          </label>
          <div className="flex flex-col justify-end gap-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-herbal-900">
              <input type="checkbox" checked={newRepeat} onChange={(e) => setNewRepeat(e.target.checked)} />
              חוזר מדי שבוע
            </label>
            {newRepeat ? (
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
                כמה פעמים (שבועות)
                <input
                  type="number"
                  min={1}
                  max={52}
                  className="rounded-lg border border-herbal-200 px-2 py-2 text-sm"
                  value={newOccurrences}
                  onChange={(e) => setNewOccurrences(Number(e.target.value))}
                />
              </label>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={addDefinition}
          className="mt-3 rounded-full border border-herbal-300 bg-white px-5 py-2 text-sm font-semibold text-herbal-900 hover:bg-herbal-50"
        >
          הוספה לרשימה
        </button>

        {definitions.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {definitions.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-herbal-100 bg-white px-3 py-2 text-sm"
              >
                <span className="text-herbal-900">{fmtDef(d)}</span>
                <button type="button" onClick={() => removeDefinition(d.id)} className="text-xs font-semibold text-rose-600 hover:underline">
                  הסרה
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-600">אין עדיין חלונות בלוח. אם קיימת זמינות בפורמט שבועי ישן בלבד, היא עדיין פעילה עד שתשמרו כאן לוח חדש.</p>
        )}

        <button
          type="button"
          disabled={pending}
          onClick={saveSettings}
          className="mt-4 rounded-full bg-herbal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-60"
        >
          {pending ? "שומר…" : "שמירת יומן וזמינות"}
        </button>
        {msg ? <p className="mt-2 text-sm text-herbal-700">{msg}</p> : null}
      </div>

      <div>
        <p className="text-sm font-semibold text-herbal-900">פגישות ובקשות</p>
        {appointments.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">אין בקשות עדיין.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {appointments.map((a) => (
              <li key={a.id} className="rounded-xl border border-herbal-100 bg-herbal-50/40 p-3 text-sm">
                <p className="font-semibold text-herbal-900">
                  {a.kind === "open_inquiry" ? "בקשת פגישה (כללית)" : "בקשת מועד ביומן"}{" "}
                  · {a.guestName}
                </p>
                {a.kind === "time_slot" ? (
                  <p className="text-xs text-slate-700">{new Date(a.slotStart).toLocaleString("he-IL")}</p>
                ) : null}
                <p className="text-xs text-slate-600">{a.guestEmail}</p>
                {a.kind === "time_slot" ? (
                  <label className="mt-2 flex items-center gap-2 text-xs font-medium text-herbal-800">
                    <input
                      type="checkbox"
                      checked={a.recurringWeekly}
                      onChange={(e) => toggleRecurring(a.id, e.target.checked)}
                      disabled={pending}
                    />
                    חוזר על עצמו שבועית
                  </label>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
