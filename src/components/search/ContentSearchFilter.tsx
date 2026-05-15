"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CONTENT_AUDIENCE_OPTIONS, type ContentAudienceId } from "@/lib/content-audience";

export type ContentFilterType = "all" | "therapist" | "product" | "article";

const TYPE_OPTIONS: { id: ContentFilterType; label: string }[] = [
  { id: "all", label: "הכל" },
  { id: "therapist", label: "מטפלים" },
  { id: "product", label: "קורסים וסדנאות" },
  { id: "article", label: "מאמרים" },
];

type Props = {
  /** אם מוגדר — חיפוש ותגיות רק בתוכן של מטפל זה */
  therapistUserId?: string;
  /** נתיב בסיס לניווט (ברירת מחדל /search או דף מטפל) */
  basePath?: string;
  className?: string;
};

export function ContentSearchFilter({ therapistUserId, basePath, className = "" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);

  const qParam = searchParams.get("q") ?? "";
  const tagParam = searchParams.get("tag") ?? "";
  const typeParam = (searchParams.get("type") as ContentFilterType) || "all";
  const audienceParam = searchParams.get("audience") as ContentAudienceId | null;

  const [q, setQ] = useState(qParam);
  const [tag, setTag] = useState(tagParam);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);

  const path = basePath ?? "/search";

  const pushFilters = useCallback(
    (next: { q?: string; tag?: string; type?: ContentFilterType; audience?: string | null }) => {
      const params = new URLSearchParams();
      const nq = next.q !== undefined ? next.q : q;
      const nt = next.tag !== undefined ? next.tag : tag;
      const ntype = next.type !== undefined ? next.type : typeParam;
      const naud = next.audience !== undefined ? next.audience : audienceParam;

      if (nq.trim()) params.set("q", nq.trim());
      if (nt.trim()) params.set("tag", nt.trim());
      if (ntype && ntype !== "all") params.set("type", ntype);
      if (naud) params.set("audience", naud);

      const qs = params.toString();
      router.push(qs ? `${path}?${qs}` : path);
    },
    [router, path, q, tag, typeParam, audienceParam],
  );

  useEffect(() => {
    setQ(qParam);
    setTag(tagParam);
  }, [qParam, tagParam]);

  useEffect(() => {
    const term = tag.trim() || q.trim();
    if (term.length < 1) {
      setSuggestions([]);
      return;
    }
    const ac = new AbortController();
    const qs = new URLSearchParams({ q: term });
    if (therapistUserId) qs.set("therapistId", therapistUserId);
    fetch(`/api/tags/suggest?${qs}`, { signal: ac.signal })
      .then((r) => r.json())
      .then((d: { tags?: string[] }) => setSuggestions(d.tags ?? []))
      .catch(() => setSuggestions([]));
    return () => ac.abort();
  }, [q, tag, therapistUserId]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setShowSuggest(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`rounded-2xl border border-herbal-100 bg-white/95 p-4 shadow-sm sm:p-5 ${className}`}
      dir="rtl"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-herbal-800/80">
        {therapistUserId ? "חיפוש בתוכן המטפל/ת" : "חיפוש באתר"}
      </p>

      <form
        className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          setShowSuggest(false);
          pushFilters({});
        }}
      >
        <div className="relative min-w-0 flex-1">
          <label htmlFor={`${listId}-q`} className="sr-only">
            חיפוש
          </label>
          <input
            id={`${listId}-q`}
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setShowSuggest(true);
            }}
            onFocus={() => setShowSuggest(true)}
            placeholder="מילת חיפוש או תגית…"
            className="w-full rounded-xl border border-herbal-200 px-3 py-2.5 text-sm text-herbal-900 outline-none focus:border-herbal-500 focus:ring-2 focus:ring-herbal-200/80"
            autoComplete="off"
            list={showSuggest && suggestions.length ? `${listId}-datalist` : undefined}
          />
          {showSuggest && suggestions.length > 0 ? (
            <ul
              className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-herbal-100 bg-white py-1 shadow-lg"
              role="listbox"
            >
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-right text-sm text-herbal-900 hover:bg-herbal-50"
                    onClick={() => {
                      setTag(s);
                      setQ("");
                      setShowSuggest(false);
                      pushFilters({ tag: s, q: "" });
                    }}
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <button
          type="submit"
          className="shrink-0 rounded-full bg-herbal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-herbal-500"
        >
          חיפוש
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="w-full text-xs font-semibold text-slate-500 sm:w-auto sm:py-1.5">סוג:</span>
        {TYPE_OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => pushFilters({ type: o.id })}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              typeParam === o.id
                ? "border-herbal-600 bg-herbal-600 text-white"
                : "border-herbal-200 text-herbal-800 hover:border-herbal-400"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="w-full text-xs font-semibold text-slate-500 sm:w-auto sm:py-1.5">קהל:</span>
        {CONTENT_AUDIENCE_OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => pushFilters({ audience: audienceParam === o.id ? null : o.id })}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              audienceParam === o.id
                ? "border-sage bg-sage/90 text-white"
                : "border-herbal-200 text-herbal-800 hover:border-herbal-400"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {(qParam || tagParam) && (
        <p className="mt-3 text-xs text-slate-600">
          מסננים פעילים:
          {qParam ? <span className="ms-1 font-medium text-herbal-800">«{qParam}»</span> : null}
          {tagParam ? <span className="ms-1 font-medium text-herbal-800">תגית: {tagParam}</span> : null}
        </p>
      )}
    </div>
  );
}
