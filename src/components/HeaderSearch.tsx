"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useId, useRef, useState } from "react";

function MagnifyingGlassIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

export function HeaderSearch() {
  const router = useRouter();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const el = wrapRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [open]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const t = q.trim();
    if (!t) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(t)}`);
  }

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        type="button"
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-herbal-200/80 bg-white/80 text-herbal-900 shadow-sm transition hover:border-herbal-300 hover:bg-white motion-reduce:transition-none"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "סגירת חיפוש" : "פתיחת חיפוש"}
        onClick={() => setOpen((o) => !o)}
      >
        <MagnifyingGlassIcon className="h-5 w-5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[90] bg-black/25 backdrop-blur-[1px] motion-reduce:backdrop-blur-none" aria-hidden />
          <div
            id={panelId}
            role="dialog"
            aria-label="חיפוש באתר"
            className="absolute left-0 top-[calc(100%+0.5rem)] z-[95] w-[min(calc(100vw-2rem),20rem)] rounded-2xl border border-herbal-200/90 bg-white/98 p-3 shadow-xl shadow-herbal-900/10 backdrop-blur-md sm:left-auto sm:right-0"
          >
            <form onSubmit={onSubmit} className="flex flex-col gap-2" role="search">
              <label htmlFor={`${panelId}-input`} className="sr-only">
                שדה חיפוש
              </label>
              <input
                id={`${panelId}-input`}
                type="search"
                autoFocus
                enterKeyHint="search"
                placeholder="חיפוש במטפלים, בקורסים ובמאמרים…"
                className="min-h-[44px] w-full rounded-xl border border-herbal-200 bg-white px-3 py-2 text-right text-sm text-herbal-950 shadow-inner outline-none focus:border-herbal-500"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                autoComplete="off"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="min-h-[44px] flex-1 rounded-xl bg-herbal-600 text-sm font-semibold text-white transition hover:bg-herbal-500"
                >
                  חיפוש
                </button>
                <button
                  type="button"
                  className="min-h-[44px] rounded-xl border border-herbal-200 px-3 text-sm text-herbal-800 transition hover:bg-herbal-50"
                  onClick={() => setOpen(false)}
                >
                  סגירה
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
