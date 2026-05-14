"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function HeaderSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const t = q.trim();
    if (!t) return;
    router.push(`/search?q=${encodeURIComponent(t)}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex min-w-0 max-w-[14rem] flex-1 items-center gap-1.5 sm:max-w-xs sm:gap-2"
      role="search"
    >
      <label htmlFor="site-header-search" className="sr-only">
        שדה חיפוש
      </label>
      <input
        id="site-header-search"
        type="search"
        enterKeyHint="search"
        placeholder="חפשו מטפלים, מוצרים, מאמרים…"
        className="min-h-[40px] min-w-0 flex-1 rounded-xl border border-herbal-200/90 bg-white/90 px-2.5 py-2 text-right text-sm text-herbal-950 shadow-inner outline-none transition focus:border-herbal-500 sm:px-3"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoComplete="off"
      />
      <button
        type="submit"
        className="shrink-0 rounded-xl border border-herbal-300 bg-herbal-50 px-2.5 py-2 text-xs font-semibold text-herbal-900 transition hover:bg-herbal-100 sm:px-3 sm:text-sm"
      >
        חיפוש
      </button>
    </form>
  );
}
