"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import type { ExploreCategory, ExploreGridItem } from "@/components/home/HomeExploreGrid";
import { ExploreCardImage } from "@/components/home/HomeExploreGrid";

const tabs: { id: ExploreCategory; label: string }[] = [
  { id: "all", label: "הכל" },
  { id: "therapists", label: "מטפלים" },
  { id: "marketplace", label: "מרקט" },
  { id: "herbal", label: "צמחים" },
];

export function HomePortfolioCarousel({ items }: { items: ExploreGridItem[] }) {
  const [filter, setFilter] = useState<ExploreCategory>("all");
  const [fade, setFade] = useState(true);

  const visible = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((x) => x.category === filter);
  }, [items, filter]);

  const setFilterAnimated = useCallback((next: ExploreCategory) => {
    if (next === filter) return;
    setFade(false);
    window.setTimeout(() => {
      setFilter(next);
      requestAnimationFrame(() => setFade(true));
    }, 180);
  }, [filter]);

  return (
    <section className="mt-0 w-full max-w-full" aria-labelledby="portfolio-heading">
      <div className="mx-auto w-full max-w-[1320px]">
        <h2 id="portfolio-heading" className="mb-3 text-center font-display text-xl font-bold text-herbal-900 sm:text-2xl">
          גלריית תוכן
        </h2>
        <p className="mx-auto mb-6 max-w-xl text-center text-sm text-slate-600 sm:text-base">
          מעבר אופקי — בחרו קטגוריה וגללו כרטיסים גדולים בהשראת תיק עבודות נקי.
        </p>

        <h3 className="sr-only" id="portfolio-tabs-label">
          סינון קטגוריות
        </h3>
        <div
          role="tablist"
          aria-labelledby="portfolio-heading"
          className="mb-6 flex flex-wrap justify-center gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]"
        >
          {tabs.map((t) => {
            const active = filter === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilterAnimated(t.id)}
                className={`min-h-[44px] shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  active
                    ? "bg-herbal-600 text-white shadow-md shadow-herbal-600/25"
                    : "border border-herbal-200/90 bg-white/80 text-herbal-900 hover:border-herbal-300 hover:bg-white"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div
          key={filter}
          className={`transition-opacity duration-500 ease-out motion-reduce:transition-none ${
            fade ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionProperty: "opacity" }}
        >
          {visible.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-herbal-200 bg-white/60 py-10 text-center text-slate-600">
              אין פריטים בקטגוריה זו כרגע.
            </p>
          ) : (
            <div
              dir="ltr"
              className="hero-vision-hide-scrollbar flex gap-4 overflow-x-auto overflow-y-visible pb-3 pt-1 [-webkit-overflow-scrolling:touch] sm:gap-5"
              style={{ scrollSnapType: "x proximity" }}
            >
              {visible.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group relative w-[min(78vw,300px)] shrink-0 snap-start overflow-hidden rounded-2xl border border-herbal-100/90 bg-white/90 shadow-glass transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none hover:-translate-y-1 hover:border-herbal-200 hover:shadow-lift sm:w-[min(72vw,320px)]"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-herbal-50">
                    <ExploreCardImage
                      imageUrl={item.imageUrl}
                      placeholderSeed={item.id}
                      variant={item.category === "therapists" ? "therapist" : "default"}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-90" />
                    <div
                      className="absolute inset-x-0 bottom-0 p-4 pt-12 text-right text-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none [@media(pointer:coarse)]:translate-y-0 [@media(pointer:coarse)]:opacity-100 [@media(pointer:fine)]:translate-y-3 [@media(pointer:fine)]:opacity-80 [@media(pointer:fine)]:group-hover:translate-y-0 [@media(pointer:fine)]:group-hover:opacity-100"
                    >
                      <span className="mb-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-100">
                        {item.badge}
                      </span>
                      <h3 className="font-display text-lg font-bold leading-snug drop-shadow-md sm:text-xl">{item.title}</h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/90 sm:text-sm">{item.subtitle}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
