"use client";

import { useMemo, useState } from "react";
import {
  APPOINTMENT_SLOT_MINUTES,
  buildOpenSlots,
  formatHourSlot,
  groupSlotsByDay,
  type HourSlot,
  type WeeklyAvailability,
} from "@/lib/therapist-availability";

type Props = {
  availability: WeeklyAvailability;
  openUntil?: Date | null;
  booked?: { start: Date; end: Date }[];
  selected?: HourSlot | null;
  onSelect?: (slot: HourSlot) => void;
  emptyMessage?: string;
};

export function AppointmentWeekDiary({
  availability,
  openUntil,
  booked = [],
  selected,
  onSelect,
  emptyMessage = "אין מועדים פנויים בשבוע זה. נסו שבוע אחר או עדכנו זמינות.",
}: Props) {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const slots = useMemo(
    () =>
      buildOpenSlots(availability, {
        weeksAhead: 1,
        weekStart,
        openUntil,
        booked,
      }),
    [availability, weekStart, openUntil, booked],
  );

  const days = useMemo(() => groupSlotsByDay(slots), [slots]);

  const weekLabel = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    const fmt: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    return `${weekStart.toLocaleDateString("he-IL", fmt)} – ${end.toLocaleDateString("he-IL", fmt)}`;
  }, [weekStart]);

  return (
    <div className="rounded-2xl border border-herbal-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-herbal-900">יומן פגישות</p>
          <p className="text-xs text-slate-500">
            חלון של {APPOINTMENT_SLOT_MINUTES} דקות בדיוק · {weekLabel}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w - 1)}
            className="rounded-lg border border-herbal-200 px-3 py-1.5 text-xs font-semibold text-herbal-800 hover:bg-herbal-50"
          >
            שבוע קודם
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset(0)}
            className="rounded-lg border border-herbal-200 px-3 py-1.5 text-xs font-semibold text-herbal-800 hover:bg-herbal-50"
          >
            השבוע
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w + 1)}
            className="rounded-lg border border-herbal-200 px-3 py-1.5 text-xs font-semibold text-herbal-800 hover:bg-herbal-50"
          >
            שבוע הבא
          </button>
        </div>
      </div>

      {days.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600">{emptyMessage}</p>
      ) : (
        <div className="mt-5 space-y-4">
          {days.map((day) => (
            <div key={day.dateKey} className="rounded-xl border border-herbal-50 bg-herbal-50/30 p-3">
              <p className="text-sm font-bold text-herbal-900">{day.label}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {day.open.map((slot) => {
                  const on =
                    selected?.start.getTime() === slot.start.getTime() &&
                    selected?.end.getTime() === slot.end.getTime();
                  return (
                    <button
                      key={slot.start.toISOString()}
                      type="button"
                      onClick={() => onSelect?.(slot)}
                      className={`min-w-[5.5rem] rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                        on
                          ? "border-herbal-600 bg-herbal-600 text-white"
                          : "border-herbal-300 bg-white text-herbal-800 hover:border-herbal-500 hover:bg-herbal-50"
                      }`}
                    >
                      {formatHourSlot(slot)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}