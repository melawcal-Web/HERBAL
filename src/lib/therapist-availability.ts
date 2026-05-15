/** שעות זמינות שבועיות — מפתח 0–6 (ראשון–שבת) */
export type WeeklyAvailability = Record<string, { start: string; end: string }[]>;

const DAY_LABELS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

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

/** מחזיר חלונות פנויים לשבועיים הקרובים (30 דקות) */
export function buildOpenSlots(
  availability: WeeklyAvailability,
  weeksAhead = 3,
  slotMinutes = 30,
): { start: Date; end: Date }[] {
  const slots: { start: Date; end: Date }[] = [];
  const now = new Date();
  const endLimit = new Date(now);
  endLimit.setDate(endLimit.getDate() + weeksAhead * 7);

  for (let d = new Date(now); d < endLimit; d.setDate(d.getDate() + 1)) {
    const dayKey = String(d.getDay());
    const ranges = availability[dayKey];
    if (!ranges?.length) continue;

    for (const range of ranges) {
      const [sh, sm] = range.start.split(":").map(Number);
      const [eh, em] = range.end.split(":").map(Number);
      if (!Number.isFinite(sh) || !Number.isFinite(eh)) continue;

      const slotStart = new Date(d);
      slotStart.setHours(sh, sm || 0, 0, 0);
      const rangeEnd = new Date(d);
      rangeEnd.setHours(eh, em || 0, 0, 0);

      for (let t = slotStart.getTime(); t + slotMinutes * 60_000 <= rangeEnd.getTime(); t += slotMinutes * 60_000) {
        const start = new Date(t);
        const end = new Date(t + slotMinutes * 60_000);
        if (start > now) slots.push({ start, end });
      }
    }
  }

  return slots.slice(0, 80);
}
