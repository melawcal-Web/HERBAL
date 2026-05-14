"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type VisionSlide = {
  id: string;
  eyebrow?: string;
  title: string;
  body: string;
  /** Optional cover image (https) */
  imageUrl?: string | null;
};

export function HomeVisionCarousel({ slides }: { slides: VisionSlide[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const n = slides.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const fn = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const scrollToIndex = useCallback(
    (i: number) => {
      const clamped = n ? ((i % n) + n) % n : 0;
      const el = scrollerRef.current?.querySelector<HTMLElement>(`[data-vision-slide="${clamped}"]`);
      el?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", inline: "center", block: "nearest" });
      setIndex(clamped);
    },
    [n, reducedMotion],
  );

  const next = useCallback(() => scrollToIndex(index + 1), [index, scrollToIndex]);
  const prev = useCallback(() => scrollToIndex(index - 1), [index, scrollToIndex]);

  useEffect(() => {
    if (n <= 1 || reducedMotion) return;
    const id = window.setInterval(() => {
      setIndex((prevI) => {
        const nextI = (prevI + 1) % n;
        requestAnimationFrame(() => {
          scrollerRef.current?.querySelector<HTMLElement>(`[data-vision-slide="${nextI}"]`)?.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest",
          });
        });
        return nextI;
      });
    }, 7200);
    return () => window.clearInterval(id);
  }, [n, reducedMotion]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || n <= 1) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting && e.intersectionRatio >= 0.45)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const raw = (visible?.target as HTMLElement | undefined)?.dataset.visionSlide;
        if (raw === undefined) return;
        const idx = Number(raw);
        if (!Number.isNaN(idx)) setIndex(idx);
      },
      { root, threshold: [0.35, 0.5, 0.65] },
    );
    root.querySelectorAll("[data-vision-slide]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [n]);

  if (!n) return null;

  return (
    <section
      className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2"
      aria-label="הקדמה — חזון המרכז"
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[var(--herbal-bg)] to-transparent sm:w-20" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[var(--herbal-bg)] to-transparent sm:w-20" />

      <div className="mb-5 px-4 text-center sm:mb-7 sm:px-8 sm:text-right">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-herbal-600">המרכז למטפלים בצמחי מרפא</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-herbal-900 sm:text-4xl md:text-[2.6rem]">חזון, ערכים ומה מחכה לכם כאן</h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600 sm:mx-0 sm:text-base">
          גללו אופקית או השתמשו בחיצים — כל שקופית היא זווית אחרת על המרכז.
        </p>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => prev()}
          className="absolute right-1 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/90 text-xl text-herbal-800 shadow-md backdrop-blur-sm transition hover:bg-white sm:flex"
          aria-label="שקופית קודמת"
        >
          ›
        </button>
        <button
          type="button"
          onClick={() => next()}
          className="absolute left-1 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/90 text-xl text-herbal-800 shadow-md backdrop-blur-sm transition hover:bg-white sm:flex"
          aria-label="שקופית הבאה"
        >
          ‹
        </button>

        <div
          ref={scrollerRef}
          dir="rtl"
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden px-4 pb-6 pt-1 [-webkit-overflow-scrolling:touch] sm:gap-6 sm:px-8"
          style={{
            scrollPaddingInline: "max(0.75rem, calc(50vw - min(44vw, 340px)))",
          }}
        >
          {slides.map((s, i) => (
            <article
              key={s.id}
              data-vision-slide={i}
              className="relative h-[min(52vh,480px)] w-[min(90vw,560px)] shrink-0 snap-center overflow-hidden rounded-[1.75rem] border border-herbal-200/60 bg-white/80 shadow-lift ring-1 ring-white/70 backdrop-blur-md sm:h-[min(48vh,440px)] sm:rounded-[2rem]"
            >
              {s.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(74,146,80,0.22),transparent_55%),linear-gradient(160deg,rgba(255,255,255,0.95),rgba(227,242,228,0.88))]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/25 to-transparent sm:from-black/70" />
              <div className="absolute inset-x-0 bottom-0 flex max-h-[62%] flex-col justify-end p-6 pb-8 text-right sm:p-8 sm:pb-10">
                {s.eyebrow && (
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/95 sm:text-[11px]"
                    style={{ textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}
                  >
                    {s.eyebrow}
                  </p>
                )}
                <h2
                  className="mt-2 font-display text-2xl font-bold leading-tight text-white sm:text-3xl md:text-[2rem]"
                  style={{ textShadow: "0 2px 18px rgba(0,0,0,0.75),0 1px 3px rgba(0,0,0,0.9)" }}
                >
                  {s.title}
                </h2>
                <p
                  className="mt-3 max-h-[40vh] overflow-y-auto text-sm leading-relaxed text-white/92 sm:text-base"
                  style={{ textShadow: "0 1px 8px rgba(0,0,0,0.65)" }}
                >
                  {s.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {n > 1 && (
        <div className="flex justify-center gap-2 pb-4">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollToIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === index ? "w-9 bg-herbal-600" : "w-2 bg-herbal-200 hover:bg-herbal-400"
              }`}
              aria-label={`שקופית ${idx + 1}`}
              aria-current={idx === index ? "true" : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
