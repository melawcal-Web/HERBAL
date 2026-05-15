"use client";

import { useMemo, useState, useTransition } from "react";
import {
  getTherapistAppointmentsForDashboard,
  saveTherapistScheduleSettings,
  setAppointmentRecurringWeekly,
} from "@/app/actions/appointments";
import { AppointmentWeekDiary } from "@/components/calendar/AppointmentWeekDiary";
import { dayLabel, type WeeklyAvailability } from "@/lib/therapist-availability";

const DAYS = [0, 1, 2, 3, 4, 5, 6];

type ApptRow = {
  id: string;
  guestName: string;
  guestEmail: string;
  slotStart: string;
  slotEnd: string;
  status: string;
  recurringWeekly: boolean;
};

type Props = {
  initialAvailability: WeeklyAvailability;
  initialOpenUntil: string | null;
  initialAppointments: ApptRow[];
};

export function TherapistSchedulePanel({
  initialAvailability,
  initialOpenUntil,
  initialAppointments,
}: Props) {
  const [availability, setAvailability] = useState<WeeklyAvailability>(initialAvailability);
  const [openUntil, setOpenUntil] = useState(initialOpenUntil ?? "");
  const [appointments, setAppointments] = useState(initialAppointments);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const booked = useMemo(
    () =>
      appointments
        .filter((a) => a.status !== "cancelled" && a.status !== "rejected")
        .map((a) => ({ start: new Date(a.slotStart), end: new Date(a.slotEnd) })),
    [appointments],
  );

  const openUntilDate = openUntil ? new Date(openUntil) : null;

  const addSlot = (day: number) => {
    const key = String(day);
    const next = { ...availability };
    next[key] = [...(next[key] ?? []), { start: "09:00", end: "17:00" }];
    setAvailability(next);
  };

  const updateSlot = (day: number, idx: number, field: "start" | "end", value: string) => {
    const key = String(day);
    const slots = [...(availability[key] ?? [])];
    slots[idx] = { ...slots[idx]!, [field]: value };
    setAvailability({ ...availability, [key]: slots });
  };

  const removeSlot = (day: number, idx: number) => {
    const key = String(day);
    const slots = (availability[key] ?? []).filter((_, i) => i !== idx);
    const next = { ...availability };
    if (slots.length) next[key] = slots;
    else delete next[key];
    setAvailability(next);
  };

  const saveSettings = () => {
    startTransition(async () => {
      await saveTherapistScheduleSettings({
        availability,
        openUntil: openUntil || null,
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

  return (
    <section className="mt-10 space-y-8 rounded-2xl border border-herbal-100 bg-white p-5 shadow-sm">
      <div>
        <h2 className="font-display text-lg font-bold text-herbal-900">יומן וזמינות</h2>
        <p className="mt-1 text-sm text-slate-600">
          הגדירו מתי אתם פנויים, עד איזה תאריך ניתן להזמין, וסמנו פגישות חוזרות שבועית.
        </p>

        <label className="mt-4 block text-sm font-medium text-herbal-900">
          פתוח להזמנות עד תאריך
          <input
            type="date"
            className="mt-1 w-full max-w-xs rounded-xl border border-herbal-200 px-3 py-2 text-sm"
            value={openUntil}
            onChange={(e) => setOpenUntil(e.target.value)}
          />
        </label>

        <p className="mt-6 text-sm font-semibold text-herbal-900">שעות זמינות שבועיות (חלונות של שעה)</p>
        <div className="mt-3 space-y-3">
          {DAYS.map((d) => (
            <div key={d} className="rounded-xl border border-herbal-50 bg-herbal-50/30 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{dayLabel(d)}</span>
                <button type="button" onClick={() => addSlot(d)} className="text-xs font-semibold text-herbal-700">
                  + חלון
                </button>
              </div>
              {(availability[String(d)] ?? []).map((slot, idx) => (
                <div key={idx} className="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(e) => updateSlot(d, idx, "start", e.target.value)}
                    className="rounded-lg border border-herbal-200 px-2 py-1 text-sm"
                  />
                  <span className="text-slate-400">עד</span>
                  <input
                    type="time"
                    value={slot.end}
                    onChange={(e) => updateSlot(d, idx, "end", e.target.value)}
                    className="rounded-lg border border-herbal-200 px-2 py-1 text-sm"
                  />
                  <button type="button" onClick={() => removeSlot(d, idx)} className="text-xs text-rose-600">
                    הסרה
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>

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
        <p className="text-sm font-semibold text-herbal-900">תצוגת מה שפתוח למבקרים</p>
        <div className="mt-3">
          <AppointmentWeekDiary
            availability={availability}
            openUntil={openUntilDate}
            booked={booked}
            emptyMessage="אין חלונות פנויים — עדכנו שעות או תאריך סיום."
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-herbal-900">פגישות שנקבעו</p>
        {appointments.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">אין בקשות עדיין.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {appointments.map((a) => (
              <li key={a.id} className="rounded-xl border border-herbal-100 bg-herbal-50/40 p-3 text-sm">
                <p className="font-semibold text-herbal-900">
                  {a.guestName} · {new Date(a.slotStart).toLocaleString("he-IL")}
                </p>
                <p className="text-xs text-slate-600">{a.guestEmail}</p>
                <label className="mt-2 flex items-center gap-2 text-xs font-medium text-herbal-800">
                  <input
                    type="checkbox"
                    checked={a.recurringWeekly}
                    onChange={(e) => toggleRecurring(a.id, e.target.checked)}
                    disabled={pending}
                  />
                  חוזר על עצמו שבועית
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
