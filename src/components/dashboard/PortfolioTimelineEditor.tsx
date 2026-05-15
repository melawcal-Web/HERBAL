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

  const update = (idx: number, patch: Partial<PortfolioTimelineEntry>) => {
    const next = [...value];
    next[idx] = { ...next[idx]!, ...patch };
    onChange(next);
  };

  return (
    <fieldset className="space-y-3 rounded-xl border border-herbal-100 bg-herbal-50/30 p-4">
      <legend className="px-1 text-sm font-semibold text-herbal-900">ציר זמן — ניסיון והשכלה</legend>
      <p className="text-xs leading-relaxed text-slate-600">
        לכל שורה: שנה בודדת (למשל 2019) או טווח משנה עד שנה, ותיאור קצר של מה עשיתם בתקופה.
      </p>

      {value.map((e, idx) => {
        const singleYear = !e.yearTo?.trim();
        return (
          <div key={e.id} className="space-y-3 rounded-xl border border-herbal-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  {singleYear ? "שנה" : "משנה"}
                </label>
                <input
                  inputMode="numeric"
                  placeholder="2014"
                  className="w-24 rounded-lg border border-herbal-200 px-2 py-2 text-sm"
                  dir="ltr"
                  value={e.yearFrom}
                  onChange={(ev) => update(idx, { yearFrom: ev.target.value.replace(/[^\d]/g, "").slice(0, 4) })}
                />
              </div>
              {!singleYear ? (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">עד שנה</label>
                  <input
                    inputMode="numeric"
                    placeholder="2018"
                    className="w-24 rounded-lg border border-herbal-200 px-2 py-2 text-sm"
                    dir="ltr"
                    value={e.yearTo ?? ""}
                    onChange={(ev) => update(idx, { yearTo: ev.target.value.replace(/[^\d]/g, "").slice(0, 4) })}
                  />
                </div>
              ) : null}
              <button
                type="button"
                className="rounded-lg border border-herbal-200 px-3 py-2 text-xs font-semibold text-herbal-800 hover:bg-herbal-50"
                onClick={() =>
                  update(idx, singleYear ? { yearTo: e.yearFrom || "" } : { yearTo: undefined })
                }
              >
                {singleYear ? "+ טווח שנים" : "שנה בודדת"}
              </button>
              <button
                type="button"
                className="ms-auto text-xs font-semibold text-rose-600 hover:underline"
                onClick={() => onChange(value.filter((_, i) => i !== idx))}
              >
                הסרה
              </button>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">מה עשיתם / השכלה / תפקיד</label>
              <textarea
                rows={2}
                placeholder="למשל: לימודי צמחי מרפא, התמחות קלינית, הוראה…"
                className="w-full rounded-lg border border-herbal-200 px-3 py-2 text-sm"
                value={e.description}
                onChange={(ev) => update(idx, { description: ev.target.value })}
              />
            </div>
            {(e.yearFrom || e.description) && (
              <p className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm text-white" dir="rtl">
                {e.yearFrom ? (
                  <span className="italic font-medium">
                    {e.yearFrom}
                    {e.yearTo?.trim() && e.yearTo !== e.yearFrom ? ` – ${e.yearTo}` : ""}
                  </span>
                ) : (
                  <span className="italic text-white/50">שנה</span>
                )}
                <span className="mx-2 text-white/70">—</span>
                <span>{e.description || "תיאור…"}</span>
              </p>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={add}
        className="rounded-full border border-herbal-300 bg-white px-4 py-2 text-sm font-semibold text-herbal-800 hover:bg-herbal-50"
      >
        + הוספת תקופה
      </button>
    </fieldset>
  );
}
