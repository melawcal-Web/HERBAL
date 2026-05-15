"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExploreCardImage } from "@/components/home/HomeExploreGrid";

export type HomeTherapistCard = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  imageUrl: string | null;
};

const DISPLAY_COUNT = 4;
const ROTATE_MS = 9000;

function shufflePick<T>(items: T[], count: number): T[] {
  if (items.length <= count) return [...items];
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, count);
}

export function HomeTherapistsRandomGrid({ therapists }: { therapists: HomeTherapistCard[] }) {
  const pool = useMemo(() => therapists, [therapists]);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [slides, setSlides] = useState<HomeTherapistCard[]>(() => shufflePick(pool, DISPLAY_COUNT));
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const rotate = useCallback(() => {
    if (pool.length <= DISPLAY_COUNT) {
      setIndex((i) => (i + 1) % Math.max(1, slides.length));
      return;
    }
    setFade(false);
    window.setTimeout(() => {
      setSlides(shufflePick(pool, DISPLAY_COUNT));
      setIndex(0);
      requestAnimationFrame(() => setFade(true));
    }, 480);
  }, [pool, slides.length]);

  useEffect(() => {
    setSlides(shufflePick(pool, DISPLAY_COUNT));
    setIndex(0);
  }, [pool]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const id = window.setInterval(rotate, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [slides.length, rotate]);

  useEffect(() => {
    const el = scrollerRef.current?.querySelector<HTMLElement>(`[data-slide="${index}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [index, slides]);

  if (pool.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-herbal-200 bg-white/60 py-10 text-center text-slate-600">
        אין מטפלים רשומים להצגה כרגע.
      </p>
    );
  }

  return (
    <section className="mt-0 w-full max-w-full" aria-labelledby="home-therapists-label">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="mb-6 flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-right">
          <div>
            <h2 id="home-therapists-label" className="font-display text-2xl font-bold text-herbal-900 sm:text-3xl">
              מטפלים
            </h2>
            <p className="mt-1 text-sm text-slate-600">ארבעה פרופילים — מתחלפים באיטיות</p>
          </div>
          <Link
            href="/therapists"
            className="shrink-0 rounded-full border border-herbal-300 px-5 py-2 text-sm font-semibold text-herbal-800 transition hover:border-herbal-500 hover:bg-herbal-50"
          >
            כל המטפלים
          </Link>
        </div>

        <div
          ref={scrollerRef}
          className={`hero-vision-hide-scrollbar flex gap-4 overflow-x-auto pb-3 pt-1 transition-opacity duration-[480ms] ease-in-out motion-reduce:transition-none [-webkit-overflow-scrolling:touch] ${
            fade ? "opacity-100" : "opacity-0"
          }`}
          style={{ scrollSnapType: "x mandatory" }}
          dir="ltr"
        >
          {slides.map((item, i) => (
            <Link
              key={`${item.id}-${i}`}
              data-slide={i}
              href={item.href}
              className="group relative w-[min(78vw,280px)] shrink-0 snap-center overflow-hidden rounded-2xl border border-herbal-100/90 bg-white/90 shadow-glass transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none hover:-translate-y-1 hover:border-herbal-200 hover:shadow-lift sm:w-[min(42vw,300px)]"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-herbal-50">
                <ExploreCardImage imageUrl={item.imageUrl} placeholderSeed={item.id} variant="therapist" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-right text-white" dir="rtl">
                  <h3 className="font-display text-lg font-bold leading-snug drop-shadow-md">{item.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/90">{item.subtitle}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {slides.length > 1 ? (
          <div className="mt-4 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`שקופית ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i === index ? "w-8 bg-herbal-600" : "w-2 bg-herbal-200"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
