/** שעות זמינות שבועיות — מפתח 0–6 (ראשון–שבת) */
export type WeeklyAvailability = Record<string, { start: string; end: string }[]>;

export type HourSlot = { start: Date; end: Date };

export type DayOpenSlots = {
  dateKey: string;
  date: Date;
  dayIndex: number;
  label: string;
  open: HourSlot[];
};

const DAY_LABELS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

/** חלון פגישה — בדיוק שעה */
export const APPOINTMENT_SLOT_MINUTES = 60;

export function parseWeeklyAvailability(raw: unknown): WeeklyAvailability {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: WeeklyAvailability = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!Array.isArray(v)) continue;
    const slots = v
      .filter((s): s is { start: string; end: string } => {
        if (s == null || typeof s !== "object") return false;
        const o = s as Record<string, unknown>;
        return typeof o.start === "string" && typeof o.end === "string";
      })
      .map((s) => ({ start: s.start.trim(), end: s.end.trim() }))
      .filter((s) => s.start && s.end);
    if (slots.length) out[k] = slots;
  }
  return out;
}

export function dayLabel(dayIndex: number): string {
  return DAY_LABELS[dayIndex] ?? String(dayIndex);
}

function dateKeyLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** מחזיר חלונות פנויים של שעה — לא פחות ולא יותר */
export function buildOpenSlots(
  availability: WeeklyAvailability,
  options?: {
    weeksAhead?: number;
    openUntil?: Date | null;
    booked?: { start: Date; end: Date }[];
    weekStart?: Date;
  },
): HourSlot[] {
  const weeksAhead = options?.weeksAhead ?? 8;
  const booked = options?.booked ?? [];
  const now = new Date();
  const openUntil = options?.openUntil;

  const rangeStart = options?.weekStart ? new Date(options.weekStart) : new Date(now);
  rangeStart.setHours(0, 0, 0, 0);

  const endLimit = new Date(rangeStart);
  endLimit.setDate(endLimit.getDate() + weeksAhead * 7);

  const hardEnd = openUntil && openUntil < endLimit ? openUntil : endLimit;

  const slots: HourSlot[] = [];
  const ms = APPOINTMENT_SLOT_MINUTES * 60_000;

  for (let d = new Date(rangeStart); d < hardEnd; d.setDate(d.getDate() + 1)) {
    const dayKey = String(d.getDay());
    const ranges = availability[dayKey];
    if (!ranges?.length) continue;

    for (const range of ranges) {
      const [sh, sm] = range.start.split(":").map(Number);
      const [eh, em] = range.end.split(":").map(Number);
      if (!Number.isFinite(sh) || !Number.isFinite(eh)) continue;

      const rangeStartDt = new Date(d);
      rangeStartDt.setHours(sh, sm || 0, 0, 0);
      const rangeEndDt = new Date(d);
      rangeEndDt.setHours(eh, em || 0, 0, 0);

      for (let t = rangeStartDt.getTime(); t + ms <= rangeEndDt.getTime(); t += ms) {
        const start = new Date(t);
        const end = new Date(t + ms);
        if (start <= now) continue;
        if (openUntil && start > openUntil) continue;
        if (booked.some((b) => overlaps(start, end, b.start, b.end))) continue;
        slots.push({ start, end });
      }
    }
  }

  return slots;
}

export function groupSlotsByDay(slots: HourSlot[]): DayOpenSlots[] {
  const map = new Map<string, DayOpenSlots>();
  for (const s of slots) {
    const key = dateKeyLocal(s.start);
    let row = map.get(key);
    if (!row) {
      const d = new Date(s.start);
      d.setHours(12, 0, 0, 0);
      row = {
        dateKey: key,
        date: d,
        dayIndex: s.start.getDay(),
        label: d.toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" }),
        open: [],
      };
      map.set(key, row);
    }
    row.open.push(s);
  }
  return [...map.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function formatHourSlot(s: HourSlot): string {
  const t = s.start.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  const t2 = s.end.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  return `${t}–${t2}`;
}

/** מרחיב פגישות חוזרות שבועית לחסימת מועדים ביומן */
export function expandBookedAppointments(
  rows: { slotStart: Date; slotEnd: Date; recurringWeekly: boolean; status: string }[],
  weeksAhead = 12,
): { start: Date; end: Date }[] {
  const out: { start: Date; end: Date }[] = [];
  for (const row of rows) {
    if (row.status === "cancelled" || row.status === "rejected") continue;
    if (!row.recurringWeekly) {
      out.push({ start: row.slotStart, end: row.slotEnd });
      continue;
    }
    for (let w = 0; w < weeksAhead; w++) {
      const start = new Date(row.slotStart);
      start.setDate(start.getDate() + w * 7);
      const end = new Date(row.slotEnd);
      end.setDate(end.getDate() + w * 7);
      out.push({ start, end });
    }
  }
  return out;
}
