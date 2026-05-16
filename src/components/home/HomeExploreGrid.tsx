"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

export type ExploreCategory = "all" | "therapists" | "courses_workshops" | "herbal";

export type ExploreGridItem = {
  id: string;
  category: Exclude<ExploreCategory, "all">;
  title: string;
  subtitle: string;
  href: string;
  imageUrl: string | null;
  badge: string;
};

const tabs: { id: ExploreCategory; label: string }[] = [
  { id: "all", label: "הכל" },
  { id: "therapists", label: "מטפלים" },
  { id: "courses_workshops", label: "קורסים וסדנאות" },
  { id: "herbal", label: "צמחים" },
];

function placeholderGradient(seed: string) {
  const hues = [142, 152, 138, 160];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i) * 13) % hues.length;
  const hue = hues[h] ?? 142;
  return `linear-gradient(135deg, hsl(${hue} 35% 88%) 0%, hsl(${hue} 28% 78%) 100%)`;
}

export function ExploreCardImage({
  imageUrl,
  backupImageUrl,
  placeholderSeed,
  variant = "default",
}: {
  imageUrl: string | null;
  /** כשהכתובת הראשית נכשלת בטעינה — מנסים גיבוי לפני placeholder */
  backupImageUrl?: string | null;
  placeholderSeed: string;
  /** מטפלים: שחור־לבן עדין לפי שפת העיצוב */
  variant?: "default" | "therapist";
}) {
  const primary = imageUrl?.trim() || null;
  const backup = backupImageUrl?.trim() || null;
  /** 0 = primary, 1 = backup, 2 = give up → placeholder */
  const [attempt, setAttempt] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    setAttempt(0);
  }, [primary, backup]);

  const src = attempt === 0 ? primary : attempt === 1 ? backup : null;
  const showImg = Boolean(src) && attempt < 2;

  const imgTone =
    variant === "therapist"
      ? "therapist-photo-bw h-full w-full object-cover contrast-[1.06] transition duration-500 group-hover:scale-[1.04]"
      : "h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]";

  if (!showImg) {
    return (
      <div
        className="flex h-full w-full items-center justify-center text-4xl text-herbal-700/35"
        style={{ background: placeholderGradient(placeholderSeed) }}
        aria-hidden
      >
        🌿
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={imgTone}
      draggable={false}
      onError={() => {
        if (attempt === 0 && backup && backup !== primary) setAttempt(1);
        else setAttempt(2);
      }}
    />
  );
}

export function HomeExploreGrid({ items }: { items: ExploreGridItem[] }) {
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
    }, 160);
  }, [filter]);

  return (
    <section className="mt-0 w-full max-w-full" aria-labelledby="explore-tabs-label">
      <h2 id="explore-tabs-label" className="sr-only">
        סינון תוכן — מטפלים, קורסים וסדנאות, ואינדקס צמחים
      </h2>

      <div
        role="tablist"
        aria-label="סינון תוכן"
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
                  ? "scale-100 bg-herbal-600 text-white shadow-md shadow-herbal-600/25"
                  : "scale-100 border border-herbal-200/90 bg-white/80 text-herbal-900 hover:border-herbal-300 hover:bg-white"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        key={filter}
        className={`grid grid-cols-2 gap-3 transition-opacity duration-500 ease-out motion-reduce:transition-none sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionProperty: "opacity" }}
      >
        {visible.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group flex min-h-0 flex-col overflow-hidden rounded-2xl border border-herbal-100/90 bg-white/90 shadow-glass transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none hover:-translate-y-1 hover:border-herbal-200 hover:shadow-lift"
          >
            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-herbal-50">
              <ExploreCardImage
                imageUrl={item.imageUrl}
                placeholderSeed={item.id}
                variant={item.category === "therapists" ? "therapist" : "default"}
              />
              <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-herbal-800 shadow-sm backdrop-blur-sm sm:text-[11px]">
                {item.badge}
              </div>
            </div>
            <div className="flex min-h-[5.5rem] flex-1 flex-col p-3 text-right sm:min-h-[6rem] sm:p-4">
              <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug text-herbal-900 sm:text-base">{item.title}</h3>
              <p className="mt-1 line-clamp-2 flex-1 text-xs leading-relaxed text-slate-600 sm:text-sm">{item.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="mt-8 rounded-2xl border border-dashed border-herbal-200 bg-white/60 py-10 text-center text-slate-600">
          אין פריטים בקטגוריה זו כרגע.
        </p>
      )}
    </section>
  );
}
