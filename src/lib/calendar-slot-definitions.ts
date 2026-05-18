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
