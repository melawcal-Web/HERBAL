"use client";

import { useState, useTransition } from "react";
import { saveTherapistWeeklyAvailability } from "@/app/actions/appointments";
import { dayLabel, type WeeklyAvailability } from "@/lib/therapist-availability";

const DAYS = [0, 1, 2, 3, 4, 5, 6];

export function WeeklyAvailabilityForm({ initial }: { initial: WeeklyAvailability }) {
  const [availability, setAvailability] = useState<WeeklyAvailability>(initial);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const addSlot = (day: number) => {
    const key = String(day);
    const next = { ...availability };
    next[key] = [...(next[key] ?? []), { start: "09:00", end: "12:00" }];
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

  return (
    <section className="mt-10 rounded-2xl border border-herbal-100 bg-white p-5 shadow-sm">
      <h2 className="font-display text-lg font-bold text-herbal-900">שעות זמינות לפגישות</h2>
      <p className="mt-1 text-sm text-slate-600">הגדירו חלונות שבועיים — המבקרים יראו מועדים פנויים בדף הציבורי.</p>

      <div className="mt-4 space-y-4">
        {DAYS.map((d) => (
          <div key={d} className="rounded-xl border border-herbal-50 bg-herbal-50/30 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-herbal-900">{dayLabel(d)}</span>
              <button
                type="button"
                onClick={() => addSlot(d)}
                className="text-xs font-semibold text-herbal-700 hover:text-herbal-900"
              >
                + הוספת חלון
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
                <button
                  type="button"
                  onClick={() => removeSlot(d, idx)}
                  className="text-xs text-rose-600 hover:underline"
                >
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
        onClick={() =>
          startTransition(async () => {
            await saveTherapistWeeklyAvailability(availability);
            setMsg("נשמר.");
          })
        }
        className="mt-4 rounded-full bg-herbal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-60"
      >
        {pending ? "שומר…" : "שמירת זמינות"}
      </button>
      {msg ? <p className="mt-2 text-sm text-herbal-700">{msg}</p> : null}
    </section>
  );
}
