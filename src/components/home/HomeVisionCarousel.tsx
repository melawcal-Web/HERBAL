"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { VisionSlide } from "@/lib/home-vision";

const sidePadStyle: CSSProperties = {
  minWidth: "max(6px, calc((100cqw - min(90cqw, 560px)) / 2))",
  scrollSnapAlign: "none",
};

type LoopMeta = { key: string; slide: VisionSlide; loopIndex: number; realIndex: number };

function buildLoop(slides: VisionSlide[]): LoopMeta[] {
  const n = slides.length;
  if (n === 0) return [];
  if (n === 1) return [{ key: slides[0]!.id, slide: slides[0]!, loopIndex: 0, realIndex: 0 }];
  const last = slides[n - 1]!;
  const first = slides[0]!;
  const out: LoopMeta[] = [];
  out.push({ key: `head-${last.id}`, slide: last, loopIndex: 0, realIndex: n - 1 });
  slides.forEach((s, i) => out.push({ key: s.id, slide: s, loopIndex: i + 1, realIndex: i }));
  out.push({ key: `tail-${first.id}`, slide: first, loopIndex: n + 1, realIndex: 0 });
  return out;
}

function getCenteredLoopIndex(root: HTMLElement): number {
  const rootRect = root.getBoundingClientRect();
  const cx = rootRect.left + rootRect.width / 2;
  let bestIdx = 0;
  let best = Infinity;
  root.querySelectorAll<HTMLElement>("[data-loop-index]").forEach((el) => {
    const r = el.getBoundingClientRect();
    const ex = r.left + r.width / 2;
    const d = Math.abs(ex - cx);
    const raw = el.dataset.loopIndex;
    const idx = raw === undefined ? NaN : Number(raw);
    if (Number.isNaN(idx)) return;
    if (d < best) {
      best = d;
      bestIdx = idx;
    }
  });
  return bestIdx;
}

function scrollLoopItemIntoView(root: HTMLElement, loopIndex: number, reducedMotion: boolean) {
  const el = root.querySelector<HTMLElement>(`[data-loop-index="${loopIndex}"]`);
  if (!el) return;
  el.scrollIntoView({
    inline: "center",
    block: "nearest",
    behavior: reducedMotion ? "auto" : "smooth",
  });
}

function instantJumpToLoopIndex(root: HTMLElement, loopIndex: number) {
  const el = root.querySelector<HTMLElement>(`[data-loop-index="${loopIndex}"]`);
  if (!el) return;
  const prevSnap = root.style.scrollSnapType;
  const prevBeh = root.style.scrollBehavior;
  root.style.scrollSnapType = "none";
  root.style.scrollBehavior = "auto";
  el.scrollIntoView({ inline: "center", block: "nearest", behavior: "auto" });
  void root.offsetWidth;
  root.style.scrollBehavior = prevBeh || "";
  root.style.scrollSnapType = prevSnap || "";
}

function VisionSlideCover({ imageUrl }: { imageUrl: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_30%_20%,rgba(74,146,80,0.22),transparent_55%),linear-gradient(160deg,rgba(255,255,255,0.95),rgba(227,242,228,0.88))]" />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt=""
      className="therapist-photo-bw absolute inset-0 z-[1] h-full w-full object-cover contrast-[1.06]"
      onError={() => setFailed(true)}
    />
  );
}

function VisionSlideCard({ slide, loopIndex }: { slide: VisionSlide; loopIndex: number }) {
  const from = slide.gradientFrom;
  const to = slide.gradientTo;
  const hasSoftBg = Boolean(from && to);
  return (
    <article
      data-loop-index={loopIndex}
      className="relative h-[min(52vh,480px)] min-h-[400px] shrink-0 snap-center overflow-hidden rounded-[1.75rem] border border-herbal-200/60 bg-white/80 shadow-lift ring-1 ring-white/70 backdrop-blur-md transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:min-h-[420px] sm:rounded-[2rem]"
      style={{ width: "min(90cqw, 560px)" }}
    >
      {hasSoftBg && (
        <div
          className="absolute inset-0 z-0"
          style={{ background: `linear-gradient(160deg, ${from}, ${to})` }}
          aria-hidden
        />
      )}
      {slide.imageUrl ? (
        <VisionSlideCover imageUrl={slide.imageUrl} />
      ) : (
        <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_30%_20%,rgba(74,146,80,0.22),transparent_55%),linear-gradient(160deg,rgba(255,255,255,0.95),rgba(227,242,228,0.88))]" />
      )}
      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/78 via-black/25 to-transparent sm:from-black/70" />
      <div className="absolute inset-x-0 bottom-0 z-[3] flex max-h-[62%] flex-col justify-end p-6 pb-8 text-right sm:p-8 sm:pb-10">
        {slide.eyebrow && (
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/95 sm:text-[11px]"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}
          >
            {slide.eyebrow}
          </p>
        )}
        <h2
          className="mt-2 font-display text-2xl font-bold leading-tight text-white sm:text-3xl md:text-[2rem]"
          style={{ textShadow: "0 2px 18px rgba(0,0,0,0.75),0 1px 3px rgba(0,0,0,0.9)" }}
        >
          {slide.title}
        </h2>
        <p
          className="mt-3 max-h-[40vh] overflow-y-auto text-sm leading-relaxed text-white/92 sm:text-base"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.65)" }}
        >
          {slide.body}
        </p>
      </div>
    </article>
  );
}

export function HomeVisionCarousel({ slides }: { slides: VisionSlide[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [realIndex, setRealIndex] = useState(() => (slides.length <= 1 ? 0 : Math.floor((slides.length - 1) / 2)));
  const [reducedMotion, setReducedMotion] = useState(false);
  const jumpLock = useRef(false);

  const n = slides.length;
  const loop = useMemo(() => buildLoop(slides), [slides]);
  const slideSig = useMemo(() => slides.map((s) => s.id).join("|"), [slides]);

  const midReal = n <= 1 ? 0 : Math.floor((n - 1) / 2);
  const midDom = n <= 1 ? 0 : 1 + midReal;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const fn = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useLayoutEffect(() => {
    const root = scrollerRef.current;
    if (!root || n === 0) return;
    jumpLock.current = true;
    instantJumpToLoopIndex(root, midDom);
    setRealIndex(midReal);
    requestAnimationFrame(() => {
      jumpLock.current = false;
    });
  }, [slideSig, n, midDom, midReal]);

  const settle = useCallback(() => {
    const root = scrollerRef.current;
    if (!root || n <= 1 || jumpLock.current) return;
    const li = getCenteredLoopIndex(root);
    if (li === 0) {
      jumpLock.current = true;
      instantJumpToLoopIndex(root, n);
      setRealIndex(n - 1);
      requestAnimationFrame(() => {
        jumpLock.current = false;
      });
      return;
    }
    if (li === n + 1) {
      jumpLock.current = true;
      instantJumpToLoopIndex(root, 1);
      setRealIndex(0);
      requestAnimationFrame(() => {
        jumpLock.current = false;
      });
      return;
    }
    if (li >= 1 && li <= n) setRealIndex(li - 1);
  }, [n]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || n <= 1) return;
    let t: number | undefined;
    const onScroll = () => {
      if (t !== undefined) window.clearTimeout(t);
      t = window.setTimeout(() => settle(), 140);
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    const onEnd = () => settle();
    root.addEventListener("scrollend", onEnd);
    return () => {
      root.removeEventListener("scroll", onScroll);
      root.removeEventListener("scrollend", onEnd);
      if (t !== undefined) window.clearTimeout(t);
    };
  }, [n, settle, slideSig]);

  const goDir = useCallback(
    (dir: 1 | -1) => {
      const root = scrollerRef.current;
      if (!root || n <= 1) return;
      const cur = getCenteredLoopIndex(root);
      const next = Math.max(0, Math.min(n + 1, cur + dir));
      scrollLoopItemIntoView(root, next, reducedMotion);
    },
    [n, reducedMotion],
  );

  const goToReal = useCallback(
    (r: number) => {
      const root = scrollerRef.current;
      if (!root || n <= 1) return;
      const dom = 1 + ((r % n) + n) % n;
      scrollLoopItemIntoView(root, dom, reducedMotion);
    },
    [n, reducedMotion],
  );

  if (!n) return null;

  return (
    <section className="relative w-full max-w-full [container-type:inline-size]" aria-label="הקדמה — חזון המרכז">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="mb-5 px-1 text-center sm:mb-7 sm:px-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-herbal-600">המרכז למטפלים בצמחי מרפא</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-herbal-900 sm:text-4xl md:text-[2.6rem]">חזון, ערכים ומה מחכה לכם כאן</h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            הזיזו בגרירה או עם החיצים — לולאה אינסופית בין השקופיות (ללא גלילה אוטומטית).
          </p>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[var(--herbal-bg)] to-transparent sm:w-16" />
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[var(--herbal-bg)] to-transparent sm:w-16" />

          {n > 1 && (
            <button
              type="button"
              onClick={() => goDir(-1)}
              className="absolute right-0 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/90 text-xl text-herbal-800 shadow-md backdrop-blur-sm transition-colors duration-200 ease-out hover:bg-white sm:flex"
              aria-label="שקופית קודמת"
            >
              ›
            </button>
          )}
          {n > 1 && (
            <button
              type="button"
              onClick={() => goDir(1)}
              className="absolute left-0 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/90 text-xl text-herbal-800 shadow-md backdrop-blur-sm transition-colors duration-200 ease-out hover:bg-white sm:flex"
              aria-label="שקופית הבאה"
            >
              ‹
            </button>
          )}

          <div
            ref={scrollerRef}
            dir="ltr"
            className="hero-vision-hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden pb-6 pt-1 [-webkit-overflow-scrolling:touch] sm:gap-6"
            style={{
              scrollPaddingInline: "max(6px, calc((100cqw - min(90cqw, 560px)) / 2))",
            }}
          >
            <div aria-hidden className="shrink-0 snap-none" style={sidePadStyle} />
            {loop.map((item) => (
              <VisionSlideCard key={item.key} slide={item.slide} loopIndex={item.loopIndex} />
            ))}
            <div aria-hidden className="shrink-0 snap-none" style={sidePadStyle} />
          </div>
        </div>

        {n > 1 && (
          <div className="flex justify-center gap-2 pb-4">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goToReal(idx)}
                className={`h-2 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  idx === realIndex ? "w-9 bg-herbal-600" : "w-2 bg-herbal-200 hover:bg-herbal-400"
                }`}
                aria-label={`שקופית ${idx + 1}`}
                aria-current={idx === realIndex ? "true" : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
