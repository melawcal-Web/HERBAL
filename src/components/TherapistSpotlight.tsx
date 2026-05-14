"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { therapistPublicHref } from "@/lib/therapist-public";

export type SpotlightTherapist = {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  bio: string;
  specialty1: string;
  specialty2: string;
  specialty3: string;
};

function specialtyLine(t: SpotlightTherapist) {
  return [t.specialty1, t.specialty2, t.specialty3].filter(Boolean).join(" · ");
}

export function TherapistSpotlight({ therapists }: { therapists: SpotlightTherapist[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const n = therapists.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const fn = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const scrollToIndex = useCallback((i: number) => {
    const clamped = n ? ((i % n) + n) % n : 0;
    const el = scrollerRef.current?.querySelector<HTMLElement>(`[data-slide-index="${clamped}"]`);
    el?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", inline: "center", block: "nearest" });
    setIndex(clamped);
  }, [n, reducedMotion]);

  const next = useCallback(() => scrollToIndex(index + 1), [index, scrollToIndex]);
  const prev = useCallback(() => scrollToIndex(index - 1), [index, scrollToIndex]);

  useEffect(() => {
    if (n <= 1 || reducedMotion) return;
    const id = window.setInterval(() => {
      setIndex((prevI) => {
        const nextI = (prevI + 1) % n;
        requestAnimationFrame(() => {
          scrollerRef.current?.querySelector<HTMLElement>(`[data-slide-index="${nextI}"]`)?.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest",
          });
        });
        return nextI;
      });
    }, 6500);
    return () => window.clearInterval(id);
  }, [n, reducedMotion]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || n <= 1) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting && e.intersectionRatio >= 0.42)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target) return;
        const raw = (visible.target as HTMLElement).dataset.slideIndex;
        const idx = raw !== undefined ? Number(raw) : NaN;
        if (!Number.isNaN(idx)) setIndex(idx);
      },
      { root, rootMargin: "0px", threshold: [0.35, 0.5, 0.65, 0.8] },
    );

    root.querySelectorAll("[data-slide-index]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [n]);

  if (!n) {
    return (
      <section className="glass-panel rounded-3xl border-dashed border-herbal-300/60 px-6 py-12 text-center text-slate-600">
        <p className="font-medium text-herbal-800">בקרוב — מטפלים יוצגו כאן</p>
        <p className="mt-2 text-sm">
          הריצו <code className="rounded bg-white px-1">npx prisma db seed</code> או פריסה עם seed כדי לראות דוגמאות.
        </p>
      </section>
    );
  }

  return (
    <section
      className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-clip"
      aria-label="מטפלים מובילים"
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--herbal-bg)] to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--herbal-bg)] to-transparent sm:w-24" />

      <div className="mb-6 flex flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-8 sm:text-right">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-herbal-600">תצוגת מטפלים</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-herbal-900 sm:text-3xl">גלריית מטפלים</h2>
          <p className="mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
            כל הכרטיס הוא תמונה — שם, התמחות וקצה מהביוגרפיה על גבי התמונה. לחיצה פותחת את דף הנחיתה המלא.
          </p>
        </div>
        <Link
          href="/therapists"
          className="link-pill pointer-events-auto shrink-0 text-sm font-semibold text-herbal-800"
        >
          כל המטפלים
        </Link>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => prev()}
          className="absolute right-2 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/35 text-2xl text-white shadow-lg backdrop-blur-md transition hover:bg-black/50 sm:flex"
          aria-label="הקודם"
        >
          ›
        </button>
        <button
          type="button"
          onClick={() => next()}
          className="absolute left-2 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/35 text-2xl text-white shadow-lg backdrop-blur-md transition hover:bg-black/50 sm:flex"
          aria-label="הבא"
        >
          ‹
        </button>

        <div
          ref={scrollerRef}
          dir="rtl"
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto overflow-y-hidden px-4 pb-6 pt-1 [scrollbar-width:thin] sm:gap-7 sm:px-10 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-herbal-300/80 [&::-webkit-scrollbar-track]:bg-herbal-100/50"
          style={{
            scrollPaddingInline: "max(1rem, calc(50vw - min(45vw, 390px)))",
          }}
        >
          {therapists.map((t, i) => (
            <Link
              key={t.id}
              data-slide-index={i}
              href={therapistPublicHref(t.id)}
              className="group relative h-[min(68vh,620px)] w-[min(92vw,780px)] shrink-0 snap-center overflow-hidden rounded-[2rem] border border-white/25 bg-herbal-900/20 shadow-[0_24px_48px_-12px_rgba(36,63,39,0.35)] ring-1 ring-black/10 transition duration-500 hover:-translate-y-1 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.45)] hover:ring-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-herbal-500"
            >
              {t.image ? (
                <Image
                  src={t.image}
                  alt=""
                  fill
                  className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                  sizes="(max-width: 768px) 92vw, 780px"
                  priority={i === 0}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-herbal-700 to-herbal-900 text-8xl font-bold text-white/25">
                  {t.name.slice(0, 1)}
                </div>
              )}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/88 via-black/35 via-40% to-transparent" />

              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-7 pb-8 sm:p-10 sm:pb-10">
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-300/90">מטפל/ת צמחי מרפא</p>
                <h3 className="mt-2 font-display text-3xl font-bold leading-tight text-white drop-shadow-md sm:text-4xl md:text-[2.75rem]">
                  {t.name}
                </h3>
                <p className="mt-2 text-sm font-medium text-white/95 sm:text-base">{specialtyLine(t)}</p>
                {t.bio?.trim() ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/80 sm:line-clamp-4 sm:text-[0.95rem]">
                    {t.bio}
                  </p>
                ) : null}
                <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200/95">
                  <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">לעמוד המלא</span>
                  <span aria-hidden className="transition group-hover:-translate-x-1">
                    ←
                  </span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {n > 1 && (
        <div className="flex justify-center gap-2 pb-2">
          {therapists.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToIndex(idx)}
              className={`h-2.5 rounded-full transition-all ${
                idx === index ? "w-10 bg-herbal-600" : "w-2.5 bg-herbal-200 hover:bg-herbal-400"
              }`}
              aria-label={`מעבר למטפל ${item.name}`}
              aria-current={idx === index ? "true" : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
