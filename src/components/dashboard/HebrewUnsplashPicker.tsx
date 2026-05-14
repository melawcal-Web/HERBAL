"use client";

import { useState } from "react";

export type UnsplashHit = { id: string; thumb: string; full: string };

export function HebrewUnsplashPicker({
  value,
  onChange,
  label = "תמונת כיסוי",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<UnsplashHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  async function search() {
    setLoading(true);
    setHint(null);
    try {
      const res = await fetch("/api/image-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q }),
      });
      const data = (await res.json()) as { error?: string; queryEn?: string; results?: UnsplashHit[] };
      if (!res.ok) throw new Error(data.error ?? "שגיאה");
      setHits(data.results ?? []);
      if (data.queryEn) setHint(`חיפוש באנגלית: ${data.queryEn}`);
    } catch (e) {
      setHint(e instanceof Error ? e.message : "שגיאה");
      setHits([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <div className="flex flex-wrap gap-2">
        <input
          className="min-h-[44px] min-w-[12rem] flex-1 rounded-xl border border-herbal-200 px-3 py-2 text-right"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="הקלידו מילת חיפוש בעברית…"
        />
        <button
          type="button"
          disabled={loading || !q.trim()}
          onClick={() => void search()}
          className="min-h-[44px] rounded-xl border border-herbal-300 bg-herbal-50 px-4 text-sm font-semibold text-herbal-900 transition hover:bg-herbal-100 disabled:opacity-50"
        >
          {loading ? "מחפשים…" : "חיפוש חכם"}
        </button>
      </div>
      {hint ? <p className="text-xs text-slate-600">{hint}</p> : null}
      {hits.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {hits.map((h) => {
            const selected = value === h.full;
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => onChange(h.full)}
                className={`overflow-hidden rounded-xl border-2 transition ${
                  selected ? "border-herbal-600 ring-2 ring-herbal-400/60" : "border-transparent hover:border-herbal-200"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={h.thumb} alt="" className="aspect-square w-full object-cover" />
              </button>
            );
          })}
        </div>
      ) : null}
      {value ? (
        <p className="truncate text-xs text-slate-500" dir="ltr" title={value}>
          נבחר: {value.slice(0, 96)}
          {value.length > 96 ? "…" : ""}
        </p>
      ) : (
        <p className="text-xs text-amber-800/90">יש לבחור תמונה מהרשת כדי לשמור.</p>
      )}
    </div>
  );
}
