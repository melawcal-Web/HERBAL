export type PortfolioTimelineEntry = {
  id: string;
  yearFrom: string;
  yearTo?: string;
  description: string;
};

export function parsePortfolioTimeline(raw: unknown): PortfolioTimelineEntry[] {
  if (!Array.isArray(raw)) return [];
  const entries: PortfolioTimelineEntry[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (item == null || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const yearFrom = typeof o.yearFrom === "string" ? o.yearFrom.trim() : "";
    const description = typeof o.description === "string" ? o.description.trim() : "";
    if (!yearFrom && !description) continue;
    const yearTo = typeof o.yearTo === "string" ? o.yearTo.trim() : "";
    const id = typeof o.id === "string" && o.id ? o.id : `tl-${i}`;
    const entry: PortfolioTimelineEntry = { id, yearFrom, description };
    if (yearTo) entry.yearTo = yearTo;
    entries.push(entry);
  }
  return entries;
}
