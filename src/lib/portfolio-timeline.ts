export type PortfolioTimelineEntry = {
  id: string;
  yearFrom: string;
  yearTo?: string;
  description: string;
};

export function parsePortfolioTimeline(raw: unknown): PortfolioTimelineEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, i) => {
      if (item == null || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const yearFrom = typeof o.yearFrom === "string" ? o.yearFrom.trim() : "";
      const description = typeof o.description === "string" ? o.description.trim() : "";
      if (!yearFrom && !description) return null;
      const yearTo = typeof o.yearTo === "string" ? o.yearTo.trim() : undefined;
      const id = typeof o.id === "string" && o.id ? o.id : `tl-${i}`;
      return { id, yearFrom, yearTo: yearTo || undefined, description };
    })
    .filter((x): x is PortfolioTimelineEntry => x != null);
}
