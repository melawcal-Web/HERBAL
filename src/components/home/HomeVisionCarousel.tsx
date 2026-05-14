"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { VisionSlide } from "@/lib/home-vision";
import { DEFAULT_VISION_SLIDES } from "@/lib/home-vision";

function slideGradients(s: VisionSlide, i: number): { from: string; to: string } {
  const d = DEFAULT_VISION_SLIDES[i % DEFAULT_VISION_SLIDES.length];
  return {
    from: s.gradientFrom ?? d?.gradientFrom ?? "#f0faf0",
    to: s.gradientTo ?? d?.gradientTo ?? "#c8e6c9",
  };
}

const TRANSITION_MS = 1600;

/**
 * Hero עליון: רקע ירוק רך שמתחלף בין שקופיות (ללא גלילה, חיצים או פס התקדמות).
 * תמונות מהמסד לא מוצגות כאן — רק gradientFrom / gradientTo (או ברירות מחדל).
 */
export function HomeVisionCarousel({ slides }: { slides: VisionSlide[] }) {
  const n = slides.length;
  const [i, setI] = useState(0);
  const [overlayOn, setOverlayOn] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const busy = useRef(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const current = slides[i] ?? slides[0];
  const nextIdx = n > 0 ? (i + 1) % n : 0;
  const next = slides[nextIdx] ?? slides[0];

  const gCurrent = useMemo(() => slideGradients(current, i), [current, i]);
  const gNext = useMemo(() => slideGradients(next, nextIdx), [next, nextIdx]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const fn = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const beginAdvance = useCallback(() => {
    if (n <= 1 || reducedMotion) return;
    if (busy.current) return;
    busy.current = true;
    setOverlayOn(true);
  }, [n, reducedMotion]);

  useEffect(() => {
    if (n <= 1 || reducedMotion) return;
    const id = window.setInterval(beginAdvance, 7200);
    return () => window.clearInterval(id);
  }, [n, reducedMotion, beginAdvance]);

  useEffect(() => {
    if (!overlayOn || reducedMotion || n <= 1) return;
    const id = window.setTimeout(() => {
      const el = overlayRef.current;
      setI((prev) => (prev + 1) % n);
      setOverlayOn(false);
      busy.current = false;
      if (el) {
        el.style.transition = "none";
        el.style.opacity = "0";
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transition = "";
          });
        });
      }
    }, TRANSITION_MS);
    return () => window.clearTimeout(id);
  }, [overlayOn, reducedMotion, n]);

  if (!n || !current) return null;

  return (
    <section
      className="relative w-full max-w-full overflow-hidden rounded-[1.75rem] border border-herbal-200/50 shadow-glass sm:rounded-[2rem]"
      aria-label="הקדמה — חזון המרכז"
    >
      <div className="relative min-h-[min(48vh,400px)] w-full sm:min-h-[420px]">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(148deg, ${gCurrent.from} 0%, ${gCurrent.to} 100%)`,
          }}
        />

        <div
          ref={overlayRef}
          className="home-hero-ambient absolute inset-0"
          style={{
            background: `linear-gradient(152deg, ${gNext.from} 0%, ${gNext.to} 100%)`,
            opacity: overlayOn ? 1 : 0,
            transition: reducedMotion ? "none" : `opacity ${TRANSITION_MS}ms ease-in-out`,
          }}
        />

        <div
          className="relative z-10 flex min-h-[min(48vh,400px)] flex-col justify-center px-5 py-10 text-right sm:min-h-[420px] sm:px-10 sm:py-12"
          aria-live="polite"
        >
          {current.eyebrow && (
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-herbal-700/90 sm:text-xs">{current.eyebrow}</p>
          )}
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-herbal-950 sm:text-4xl md:text-[2.45rem]">
            {current.title}
          </h1>
          <p className="mx-auto mr-0 mt-4 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">{current.body}</p>
        </div>
      </div>
    </section>
  );
}
