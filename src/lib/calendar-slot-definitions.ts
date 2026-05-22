import { APPOINTMENT_SLOT_MINUTES, buildOpenSlots, type HourSlot, type WeeklyAvailability } from "@/lib/therapist-availability";

export type CalendarSlotDefinition = {
  id: string;
  /** התחלה — ISO 8601 */
  startISO: string;
  /** סיום — ISO 8601 (אותו יום מומלץ) */
  endISO: string;
  repeatWeekly: boolean;
  /** מספר מופעים כולל (כולל הראשון). ללא חזרה — תמיד 1 */
  occurrences: number;
};

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function parseDefinitions(raw: unknown): CalendarSlotDefinition[] {
  if (!Array.isArray(raw)) return [];
  const out: CalendarSlotDefinition[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id.trim() : "";
    const startISO = typeof o.startISO === "string" ? o.startISO.trim() : "";
    const endISO = typeof o.endISO === "string" ? o.endISO.trim() : "";
    const repeatWeekly = Boolean(o.repeatWeekly);
    const occRaw = o.occurrences;
    const occurrences =
      typeof occRaw === "number" && Number.isFinite(occRaw) && occRaw >= 1
        ? Math.min(52, Math.floor(occRaw))
        : 1;
    if (!id || !startISO || !endISO) continue;
    const s = new Date(startISO);
    const e = new Date(endISO);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e <= s) continue;
    out.push({ id, startISO, endISO, repeatWeekly, occurrences: repeatWeekly ? occurrences : 1 });
  }
  return out;
}

export function parseCalendarSlotDefinitions(raw: unknown): CalendarSlotDefinition[] {
  return parseDefinitions(raw);
}

/**
 * מרחיב הגדרות לוח (תאריך+שעה, חזרה שבועית ומספר מופעים) לחלונות של שעה.
 */
export function buildOpenSlotsFromCalendarDefinitions(
  definitions: CalendarSlotDefinition[],
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

  for (const def of definitions) {
    const baseStart = new Date(def.startISO);
    const baseEnd = new Date(def.endISO);
    if (Number.isNaN(baseStart.getTime()) || Number.isNaN(baseEnd.getTime()) || baseEnd <= baseStart) continue;
    const durationMs = baseEnd.getTime() - baseStart.getTime();

    const count = def.repeatWeekly ? Math.min(52, Math.max(1, def.occurrences)) : 1;
    for (let i = 0; i < count; i++) {
      const rangeStartDt = new Date(baseStart.getTime() + (def.repeatWeekly ? i * 7 * 24 * 60 * 60 * 1000 : 0));
      const rangeEndDt = new Date(rangeStartDt.getTime() + durationMs);

      if (rangeEndDt <= now) continue;
      if (openUntil && rangeStartDt > openUntil) continue;
      if (rangeStartDt >= hardEnd) break;

      for (let t = rangeStartDt.getTime(); t + ms <= rangeEndDt.getTime(); t += ms) {
        const start = new Date(t);
        const end = new Date(t + ms);
        if (start <= now) continue;
        if (openUntil && start > openUntil) continue;
        if (start < rangeStart || start >= hardEnd) continue;
        if (booked.some((b) => overlaps(start, end, b.start, b.end))) continue;
        slots.push({ start, end });
      }
    }
  }

  slots.sort((a, b) => a.start.getTime() - b.start.getTime());
  return dedupeSlots(slots);
}

function dedupeSlots(slots: HourSlot[]): HourSlot[] {
  const seen = new Set<string>();
  const out: HourSlot[] = [];
  for (const s of slots) {
    const k = `${s.start.getTime()}-${s.end.getTime()}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(s);
  }
  return out;
}

function dateKeyLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function hasUnbookedSegment(rangeStart: Date, rangeEnd: Date, booked: { start: Date; end: Date }[], now: Date): boolean {
  const from = rangeStart < now ? now : rangeStart;
  if (from >= rangeEnd) return false;
  const step = 15 * 60_000;
  for (let t = from.getTime(); t < rangeEnd.getTime(); t += step) {
    const segStart = new Date(t);
    const segEnd = new Date(Math.min(t + step, rangeEnd.getTime()));
    if (!booked.some((b) => overlaps(segStart, segEnd, b.start, b.end))) return true;
  }
  return false;
}

/** ימים עם זמינות פנויה (כחול) בתוך טווח תצוגה — כולל חלונות קצרים מ־60 דק׳ */
export function collectFreeAvailabilityDayKeys(
  weekly: WeeklyAvailability,
  definitionsRaw: unknown,
  rangeStart: Date,
  rangeEnd: Date,
  booked: { start: Date; end: Date }[] = [],
): Set<string> {
  const keys = new Set<string>();
  const now = new Date();

  const weeksAhead = Math.max(1, Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1);
  for (const slot of buildPublicOpenSlots(weekly, definitionsRaw, { weekStart: rangeStart, weeksAhead, booked })) {
    if (slot.start > rangeEnd || slot.end < rangeStart) continue;
    keys.add(dateKeyLocal(slot.start));
  }

  const definitions = parseCalendarSlotDefinitions(definitionsRaw);
  for (const def of definitions) {
    const baseStart = new Date(def.startISO);
    const baseEnd = new Date(def.endISO);
    if (Number.isNaN(baseStart.getTime()) || Number.isNaN(baseEnd.getTime()) || baseEnd <= baseStart) continue;
    const durationMs = baseEnd.getTime() - baseStart.getTime();
    const count = def.repeatWeekly ? Math.min(52, Math.max(1, def.occurrences)) : 1;
    for (let i = 0; i < count; i++) {
      const occStart = new Date(baseStart.getTime() + (def.repeatWeekly ? i * 7 * 24 * 60 * 60 * 1000 : 0));
      const occEnd = new Date(occStart.getTime() + durationMs);
      if (occEnd <= rangeStart || occStart > rangeEnd) continue;
      if (occEnd <= now) continue;
      if (!hasUnbookedSegment(occStart, occEnd, booked, now)) continue;
      keys.add(dateKeyLocal(occStart));
    }
  }

  if (definitions.length === 0) {
    const d = new Date(rangeStart);
    d.setHours(0, 0, 0, 0);
    const end = new Date(rangeEnd);
    end.setHours(23, 59, 59, 999);
    while (d <= end) {
      const dayKey = String(d.getDay());
      const ranges = weekly[dayKey];
      if (ranges?.length) {
        for (const range of ranges) {
          const [sh, sm] = range.start.split(":").map(Number);
          const [eh, em] = range.end.split(":").map(Number);
          if (!Number.isFinite(sh) || !Number.isFinite(eh)) continue;
          const rangeStartDt = new Date(d);
          rangeStartDt.setHours(sh, sm || 0, 0, 0);
          const rangeEndDt = new Date(d);
          rangeEndDt.setHours(eh, em || 0, 0, 0);
          if (rangeEndDt <= now) continue;
          if (hasUnbookedSegment(rangeStartDt, rangeEndDt, booked, now)) keys.add(dateKeyLocal(d));
        }
      }
      d.setDate(d.getDate() + 1);
    }
  }

  return keys;
}

/** חלונות זמינות ליום בודד (לפירוט ביומן מטפל) */
export function getAvailabilityWindowsForDay(
  weekly: WeeklyAvailability,
  definitionsRaw: unknown,
  dayKey: string,
  booked: { start: Date; end: Date }[] = [],
): HourSlot[] {
  const now = new Date();
  const day = new Date(`${dayKey}T12:00:00`);
  if (Number.isNaN(day.getTime())) return [];
  const out: HourSlot[] = [];

  const definitions = parseCalendarSlotDefinitions(definitionsRaw);
  for (const def of definitions) {
    const baseStart = new Date(def.startISO);
    const baseEnd = new Date(def.endISO);
    if (Number.isNaN(baseStart.getTime()) || Number.isNaN(baseEnd.getTime()) || baseEnd <= baseStart) continue;
    const durationMs = baseEnd.getTime() - baseStart.getTime();
    const count = def.repeatWeekly ? Math.min(52, Math.max(1, def.occurrences)) : 1;
    for (let i = 0; i < count; i++) {
      const occStart = new Date(baseStart.getTime() + (def.repeatWeekly ? i * 7 * 24 * 60 * 60 * 1000 : 0));
      const occEnd = new Date(occStart.getTime() + durationMs);
      if (dateKeyLocal(occStart) !== dayKey) continue;
      if (occEnd <= now) continue;
      if (!hasUnbookedSegment(occStart, occEnd, booked, now)) continue;
      out.push({ start: occStart, end: occEnd });
    }
  }

  if (definitions.length === 0) {
    const ranges = weekly[String(day.getDay())];
    if (ranges?.length) {
      for (const range of ranges) {
        const [sh, sm] = range.start.split(":").map(Number);
        const [eh, em] = range.end.split(":").map(Number);
        if (!Number.isFinite(sh) || !Number.isFinite(eh)) continue;
        const rangeStartDt = new Date(day);
        rangeStartDt.setHours(sh, sm || 0, 0, 0);
        const rangeEndDt = new Date(day);
        rangeEndDt.setHours(eh, em || 0, 0, 0);
        if (rangeEndDt <= now) continue;
        if (hasUnbookedSegment(rangeStartDt, rangeEndDt, booked, now)) out.push({ start: rangeStartDt, end: rangeEndDt });
      }
    }
  }

  out.sort((a, b) => a.start.getTime() - b.start.getTime());
  return out;
}

/** חיבור זמינות: אם יש הגדרות לוח — הן גוברות; אחרת תבנית שבועית ישנה */
export function buildPublicOpenSlots(
  weekly: WeeklyAvailability,
  definitionsRaw: unknown,
  options?: {
    weeksAhead?: number;
    openUntil?: Date | null;
    booked?: { start: Date; end: Date }[];
    weekStart?: Date;
  },
): HourSlot[] {
  const definitions = parseCalendarSlotDefinitions(definitionsRaw);
  if (definitions.length > 0) {
    return buildOpenSlotsFromCalendarDefinitions(definitions, options);
  }
  return buildOpenSlots(weekly, options);
}
