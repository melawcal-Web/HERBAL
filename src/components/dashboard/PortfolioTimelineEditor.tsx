"use client";

import type { PortfolioTimelineEntry } from "@/lib/portfolio-timeline";

export function PortfolioTimelineEditor({
  value,
  onChange,
}: {
  value: PortfolioTimelineEntry[];
  onChange: (next: PortfolioTimelineEntry[]) => void;
}) {
  const add = () => {
    onChange([...value, { id: `tl-${Date.now()}`, yearFrom: "", description: "" }]);
  };

  return (
    <fieldset className="space-y-3 rounded-xl border border-herbal-100 bg-herbal-50/30 p-4">
      <legend className="text-sm font-semibold text-herbal-900">ציר זמן — ניסיון והשכלה</legend>
      {value.map((e, idx) => (
        <div key={e.id} className="space-y-2 rounded-lg border border-herbal-100 bg-white p-3">
          <div className="flex flex-wrap gap-2">
            <input
              placeholder="משנה"
              className="w-24 rounded-lg border border-herbal-200 px-2 py-1.5 text-sm"
              value={e.yearFrom}
              onChange={(ev) => {
                const next = [...value];
                next[idx] = { ...e, yearFrom: ev.target.value };
                onChange(next);
              }}
            />
            <input
              placeholder="עד שנה (אופציונלי)"
              className="w-28 rounded-lg border border-herbal-200 px-2 py-1.5 text-sm"
              value={e.yearTo ?? ""}
              onChange={(ev) => {
                const next = [...value];
                next[idx] = { ...e, yearTo: ev.target.value || undefined };
                onChange(next);
              }}
            />
            <button
              type="button"
              className="text-xs text-rose-600"
              onClick={() => onChange(value.filter((_, i) => i !== idx))}
            >
              הסרה
            </button>
          </div>
          <textarea
            rows={2}
            placeholder="תיאור"
            className="w-full rounded-lg border border-herbal-200 px-2 py-1.5 text-sm"
            value={e.description}
            onChange={(ev) => {
              const next = [...value];
              next[idx] = { ...e, description: ev.target.value };
              onChange(next);
            }}
          />
        </div>
      ))}
      <button type="button" onClick={add} className="text-sm font-semibold text-herbal-700">
        + הוספת תקופה
      </button>
    </fieldset>
  );
}
