"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildPublicOpenSlots,
  collectFreeAvailabilityDayKeys,
  getAvailabilityWindowsForDay,
  type CalendarSlotDefinition,
} from "@/lib/calendar-slot-definitions";
import type { HourSlot } from "@/lib/therapist-availability";
import type { WeeklyAvailability } from "@/lib/therapist-availability";

function dateKeyLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const WEEKDAY_LABELS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

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

type ExpandedAppt = { start: Date; end: Date; row: ApptRow };

function expandAppointmentsForRange(rows: ApptRow[], rangeStart: Date, rangeEnd: Date): ExpandedAppt[] {
  const out: ExpandedAppt[] = [];
  for (const a of rows) {
    if (a.status === "cancelled" || a.status === "rejected") continue;
    const start = new Date(a.slotStart);
    const end = new Date(a.slotEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) continue;

    if (a.kind === "open_inquiry") {
      if (start <= rangeEnd && start >= rangeStart) out.push({ start, end, row: a });
      continue;
    }

    if (!a.recurringWeekly) {
      if (start <= rangeEnd && end >= rangeStart) out.push({ start, end, row: a });
      continue;
    }

    for (let w = 0; w < 16; w++) {
      const s = new Date(start);
      s.setDate(s.getDate() + w * 7);
      const e = new Date(end);
      e.setDate(e.getDate() + w * 7);
      if (s > rangeEnd) break;
      if (e < rangeStart) continue;
      out.push({ start: s, end: e, row: a });
    }
  }
  return out;
}

function groupByDay<T extends { start: Date }>(items: T[]): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const it of items) {
    const k = dateKeyLocal(it.start);
    const arr = m.get(k) ?? [];
    arr.push(it);
    m.set(k, arr);
  }
  for (const arr of m.values()) {
    arr.sort((a, b) => a.start.getTime() - b.start.getTime());
  }
  return m;
}

type Props = {
  weeklyAvailability: WeeklyAvailability;
  definitions: CalendarSlotDefinition[];
  /** תורים מאושרים/ממתינים — לחישוב חלונות פנויים */
  bookedBlocks: { start: Date; end: Date }[];
  appointments: ApptRow[];
};

export function TherapistDashboardMonthCalendar({
  weeklyAvailability,
  definitions,
  bookedBlocks,
  appointments,
}: Props) {
  const [view, setView] = useState(() => {
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth() };
  });
  const [detailKey, setDetailKey] = useState<string | null>(null);

  const monthStart = useMemo(() => new Date(view.y, view.m, 1), [view.y, view.m]);

  const gridRange = useMemo(() => {
    const padStart = monthStart.getDay();
    const gridStart = new Date(monthStart);
    gridStart.setDate(gridStart.getDate() - padStart);
    gridStart.setHours(0, 0, 0, 0);
    const cells = 42;
    const gridEnd = new Date(gridStart);
    gridEnd.setDate(gridEnd.getDate() + cells - 1);
    gridEnd.setHours(23, 59, 59, 999);
    return { gridStart, gridEnd };
  }, [monthStart]);

  const weeksAhead = useMemo(() => {
    const days = Math.ceil((gridRange.gridEnd.getTime() - gridRange.gridStart.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    return Math.max(6, Math.ceil(days / 7) + 1);
  }, [gridRange.gridStart, gridRange.gridEnd]);

  const allFreeSlots = useMemo(() => {
    return buildPublicOpenSlots(weeklyAvailability, definitions, {
      weekStart: gridRange.gridStart,
      weeksAhead,
      booked: bookedBlocks,
    });
  }, [weeklyAvailability, definitions, bookedBlocks, gridRange.gridStart, weeksAhead]);

  const freeByDay = useMemo(() => groupByDay<HourSlot>(allFreeSlots), [allFreeSlots]);

  const freeDayKeys = useMemo(
    () =>
      collectFreeAvailabilityDayKeys(
        weeklyAvailability,
        definitions,
        gridRange.gridStart,
        gridRange.gridEnd,
        bookedBlocks,
        { forTherapistDashboard: true },
      ),
    [weeklyAvailability, definitions, bookedBlocks, gridRange.gridStart, gridRange.gridEnd],
  );

  const expandedAppts = useMemo(
    () => expandAppointmentsForRange(appointments, gridRange.gridStart, gridRange.gridEnd),
    [appointments, gridRange.gridStart, gridRange.gridEnd],
  );

  const apptByDay = useMemo(() => groupByDay(expandedAppts), [expandedAppts]);

  const cells = useMemo(() => {
    const list: { date: Date; inMonth: boolean; key: string }[] = [];
    const d = new Date(gridRange.gridStart);
    for (let i = 0; i < 42; i++) {
      const key = dateKeyLocal(d);
      list.push({
        date: new Date(d),
        inMonth: d.getMonth() === view.m,
        key,
      });
      d.setDate(d.getDate() + 1);
    }
    return list;
  }, [gridRange.gridStart, view.m]);

  const detailFree = useMemo(() => {
    if (!detailKey) return [];
    const hourly = freeByDay.get(detailKey) ?? [];
    if (hourly.length > 0) return hourly;
    return getAvailabilityWindowsForDay(weeklyAvailability, definitions, detailKey, bookedBlocks, {
      forTherapistDashboard: true,
    });
  }, [detailKey, freeByDay, weeklyAvailability, definitions, bookedBlocks]);
  const detailAppts = detailKey ? apptByDay.get(detailKey) ?? [] : [];

  const closeDetail = useCallback(() => setDetailKey(null), []);

  useEffect(() => {
    if (!detailKey) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [detailKey]);

  useEffect(() => {
    if (!detailKey) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDetail();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [detailKey, closeDetail]);

  const title = monthStart.toLocaleDateString("he-IL", { month: "long", year: "numeric" });

  return (
    <div className="rounded-2xl border border-herbal-100 bg-white p-4 shadow-sm sm:p-5" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-herbal-900">יומן — תצוגה חודשית</p>
          <p className="mt-1 text-xs text-slate-500">
            סימונים רק כשיש נתון:{" "}
            <span className="me-3 inline-flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-500" aria-hidden />
              פנוי
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500" aria-hidden />
              תור / בקשה
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-herbal-200 px-3 py-1.5 text-xs font-semibold text-herbal-800 hover:bg-herbal-50"
            onClick={() => setView((v) => ({ y: v.m === 0 ? v.y - 1 : v.y, m: v.m === 0 ? 11 : v.m - 1 }))}
          >
            חודש קודם
          </button>
          <span className="min-w-[8rem] text-center text-sm font-bold text-herbal-900">{title}</span>
          <button
            type="button"
            className="rounded-lg border border-herbal-200 px-3 py-1.5 text-xs font-semibold text-herbal-800 hover:bg-herbal-50"
            onClick={() => setView((v) => ({ y: v.m === 11 ? v.y + 1 : v.y, m: v.m === 11 ? 0 : v.m + 1 }))}
          >
            חודש הבא
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map(({ date, inMonth, key }) => {
          const freeN = freeByDay.get(key)?.length ?? 0;
          const hasFree = freeN > 0 || freeDayKeys.has(key);
          const apptN = apptByDay.get(key)?.length ?? 0;
          const today = dateKeyLocal(new Date()) === key;
          return (
            <button
              key={key}
              type="button"
              aria-label={`${date.toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })} — פתיחת פירוט`}
              onClick={() => setDetailKey(key)}
              className={`relative flex min-h-[3.25rem] flex-col items-center justify-start rounded-xl border px-0.5 py-1.5 text-center transition sm:min-h-[4rem] sm:py-2 ${
                inMonth ? "border-herbal-100 bg-white hover:border-herbal-300 hover:bg-herbal-50/60" : "border-transparent bg-herbal-50/20 text-slate-400"
              } ${today ? "ring-2 ring-herbal-500 ring-offset-1" : ""}`}
            >
              <span className={`text-xs font-semibold sm:text-sm ${inMonth ? "text-herbal-950" : ""}`}>{date.getDate()}</span>
              <span className="mt-auto flex min-h-[14px] items-center justify-center gap-1">
                {hasFree ? (
                  <span
                    className="h-2 w-2 rounded-full bg-sky-500"
                    title={freeN > 0 ? `${freeN} חלונות פנויים` : "יש זמינות ביום זה"}
                  />
                ) : null}
                {apptN > 0 ? <span className="h-2 w-2 rounded-full bg-rose-500" title={`${apptN} תורים`} /> : null}
              </span>
            </button>
          );
        })}
      </div>

      {detailKey ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-[1px] sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="day-detail-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeDetail();
          }}
        >
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-herbal-100 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-2">
              <h3 id="day-detail-title" className="font-display text-lg font-bold text-herbal-900">
                {new Date(detailKey + "T12:00:00").toLocaleDateString("he-IL", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-herbal-50 hover:text-herbal-900"
                onClick={closeDetail}
              >
                סגירה
              </button>
            </div>

            <section className="mt-5">
              <h4 className="text-xs font-bold uppercase tracking-wide text-sky-700">חלונות פנויים</h4>
              {detailFree.length === 0 ? (
                <p className="mt-2 text-sm text-slate-600">אין חלונות פנויים ביום זה.</p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {detailFree.map((s) => (
                    <li key={s.start.toISOString()} className="rounded-lg bg-sky-50 px-3 py-2 text-sm font-medium text-sky-950">
                      {s.start.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })} –{" "}
                      {s.end.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-6 border-t border-herbal-100 pt-5">
              <h4 className="text-xs font-bold uppercase tracking-wide text-rose-700">תורים ובקשות</h4>
              {detailAppts.length === 0 ? (
                <p className="mt-2 text-sm text-slate-600">אין רשומות ביום זה.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {detailAppts.map((x) => (
                    <li key={`${x.row.id}-${x.start.getTime()}`} className="rounded-lg border border-rose-100 bg-rose-50/80 px-3 py-2 text-sm">
                      <p className="font-semibold text-rose-950">
                        {x.row.kind === "open_inquiry" ? "בקשה כללית" : "תור"} · {x.row.guestName}
                      </p>
                      {x.row.kind === "time_slot" ? (
                        <p className="text-xs text-rose-900/90">
                          {x.start.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })} –{" "}
                          {x.end.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      ) : null}
                      <p className="text-xs text-slate-600">{x.row.guestEmail}</p>
                      <p className="text-[11px] text-slate-500">סטטוס: {x.row.status}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
