"use client";

import { useState, useTransition } from "react";
import { searchUnsplashPhotos } from "@/app/actions/unsplash";

export function UnsplashPicker({ onPick }: { onPick: (imageUrl: string) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Awaited<ReturnType<typeof searchUnsplashPhotos>>>([]);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function runSearch() {
    setErr(null);
    startTransition(async () => {
      try {
        const r = await searchUnsplashPhotos(q);
        setResults(r);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "שגיאה");
        setResults([]);
      }
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-herbal-200/90 bg-white/60 p-3 text-right">
      <p className="text-xs font-semibold text-herbal-800">חיפוש תמונה ב-Unsplash</p>
      <p className="text-[11px] leading-snug text-slate-500">
        נדרש מפתח <span className="font-mono">UNSPLASH_ACCESS_KEY</span> בקובץ הסביבה (Vercel / .env). התמונות לשימוש חופשי לפי תנאי Unsplash.
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), runSearch())}
          placeholder="למשל: herbs, forest, tea…"
          className="min-w-[12rem] flex-1 rounded-lg border border-herbal-200 bg-white px-3 py-2 text-sm outline-none focus:border-herbal-500"
          dir="ltr"
        />
        <button
          type="button"
          onClick={runSearch}
          disabled={pending || !q.trim()}
          className="rounded-lg border border-herbal-300 bg-herbal-50 px-4 py-2 text-sm font-semibold text-herbal-900 transition hover:bg-herbal-100 disabled:opacity-50"
        >
          {pending ? "מחפש…" : "חיפוש"}
        </button>
      </div>
      {err && <p className="text-xs text-red-700">{err}</p>}
      {results.length > 0 && (
        <div className="grid max-h-56 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onPick(r.imageUrl)}
              className="group relative aspect-video overflow-hidden rounded-lg border border-herbal-100 bg-herbal-50 shadow-sm outline-none ring-herbal-400 transition hover:ring-2 focus-visible:ring-2"
              title={r.description ?? ""}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.thumbUrl} alt="" className="h-full w-full object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-black/55 py-0.5 text-[9px] text-white opacity-0 transition group-hover:opacity-100">
                בחירה
              </span>
            </button>
          ))}
        </div>
      )}
      {!pending && q.trim() && results.length === 0 && !err && (
        <p className="text-xs text-slate-500">לא נמצאו תוצאות — נסו מילת חיפוש אחרת או בדקו שהמפתח הוגדר.</p>
      )}
    </div>
  );
}
