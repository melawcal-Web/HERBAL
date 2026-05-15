"use client";

import { useId, useState } from "react";
import type { ContentChapter } from "@/lib/content-chapters";

export function ChaptersAccordion({ chapters, className = "" }: { chapters: ContentChapter[]; className?: string }) {
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(chapters[0]?.id ?? null);

  if (chapters.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`} dir="rtl">
      {chapters.map((ch) => {
        const open = openId === ch.id;
        return (
          <div key={ch.id} className="overflow-hidden rounded-xl border border-herbal-100 bg-white shadow-sm">
            <button
              type="button"
              id={`${baseId}-${ch.id}`}
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : ch.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-right text-sm font-semibold text-herbal-900 hover:bg-herbal-50/80"
            >
              <span>{ch.title}</span>
              <span className="text-herbal-600" aria-hidden>
                {open ? "−" : "+"}
              </span>
            </button>
            {open ? (
              <div
                id={`${baseId}-${ch.id}-panel`}
                role="region"
                aria-labelledby={`${baseId}-${ch.id}`}
                className="border-t border-herbal-50 px-4 py-3 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap"
              >
                {ch.body || "—"}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

