"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type TherapistShowcaseItem = {
  slug: string;
  name: string;
  image: string | null;
  specialty1: string;
  specialty2: string;
  specialty3: string;
};

function specialtyLine(t: TherapistShowcaseItem) {
  return [t.specialty1, t.specialty2, t.specialty3].filter(Boolean).join(" · ");
}

/** Distance from viewport center → for parallax only */
function centerNorm(root: DOMRect, slide: DOMRect): number {
  const rootCx = root.left + root.width / 2;
  const slideCx = slide.left + slide.width / 2;
  return Math.min(1, Math.abs(slideCx - rootCx) / Math.max(120, root.width * 0.42));
}

type SlideVisual = { parallaxX: number };

/** Half of card width: min(41vw, 200px) for w = min(82vw, 400px) */
const SCROLL_SIDE_PAD = "max(6px, calc(50vw - min(41vw, 200px)))";

export function TherapistsShowcaseCarousel({ items }: { items: TherapistShowcaseItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visuals, setVisuals] = useState<SlideVisual[]>(() => items.map(() => ({ parallaxX: 0 })));
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const suppressNavRef = useRef(false);
  const dragRef = useRef({ active: false, pointerId: 0, startX: 0, startScroll: 0, moved: false });
  const rafRef = useRef<number | null>(null);

  const n = items.length;

  const slugKey = items.map((x) => x.slug).join("|");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const fn = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const updateVisuals = useCallback(() => {
    const root = scrollRef.current;
    if (!root || !n) return;
    const rootRect = root.getBoundingClientRect();
    const cards = root.querySelectorAll<HTMLElement>("[data-showcase-card]");
    const next: SlideVisual[] = [];
    cards.forEach((card) => {
      const r = card.getBoundingClientRect();
      const norm = centerNorm(rootRect, r);
      if (reducedMotion) {
        next.push({ parallaxX: 0 });
      } else {
        const slideCx = r.left + r.width / 2;
        const rootCx = rootRect.left + rootRect.width / 2;
        const parallaxX = (slideCx - rootCx) * -0.12 * (1 - norm * 0.35);
        next.push({ parallaxX });
      }
    });
    if (next.length) setVisuals(next);
  }, [n, reducedMotion]);

  const scheduleUpdate = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      updateVisuals();
    });
  }, [updateVisuals]);

  useEffect(() => {
    setVisuals(items.map(() => ({ parallaxX: 0 })));
  }, [slugKey]);

  /** Center first card on load / when list changes */
  useEffect(() => {
    if (n < 1) return;
    const id = window.setTimeout(() => {
      scrollRef.current?.querySelector<HTMLElement>(`[data-showcase-card="0"]`)?.scrollIntoView({
        inline: "center",
        block: "nearest",
        behavior: "auto",
      });
      scheduleUpdate();
    }, 80);
    return () => window.clearTimeout(id);
  }, [slugKey, n, scheduleUpdate]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root || n <= 1) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting && e.intersectionRatio >= 0.4)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const raw = (visible?.target as HTMLElement | undefined)?.dataset.showcaseCard;
        if (raw === undefined) return;
        const idx = Number(raw);
        if (!Number.isNaN(idx)) setActiveIndex(idx);
      },
      { root, threshold: [0.35, 0.5, 0.65] },
    );
    root.querySelectorAll("[data-showcase-card]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [n, slugKey]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateVisuals();
    el.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    return () => {
      el.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [scheduleUpdate, updateVisuals, n]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const dominantY = Math.abs(e.deltaY) >= Math.abs(e.deltaX);
      if (!dominantY) return;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const max = scrollWidth - clientWidth;
      const atStart = scrollLeft <= 2;
      const atEnd = scrollLeft >= max - 2;
      if (e.deltaY < 0 && atStart) return;
      if (e.deltaY > 0 && atEnd) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
      scheduleUpdate();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [scheduleUpdate, n]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || n <= 1) return;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (e.button !== 0) return;
      dragRef.current = {
        active: true,
        pointerId: e.pointerId,
        startX: e.clientX,
        startScroll: el.scrollLeft,
        moved: false,
      };
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      el.classList.add("cursor-grabbing");
    };

    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active || e.pointerId !== dragRef.current.pointerId) return;
      const dx = e.clientX - dragRef.current.startX;
      if (Math.abs(dx) > 4) dragRef.current.moved = true;
      el.scrollLeft = dragRef.current.startScroll - dx;
      scheduleUpdate();
    };

    const end = (e: PointerEvent) => {
      if (!dragRef.current.active || e.pointerId !== dragRef.current.pointerId) return;
      dragRef.current.active = false;
      el.classList.remove("cursor-grabbing");
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      if (dragRef.current.moved) {
        suppressNavRef.current = true;
        window.setTimeout(() => {
          suppressNavRef.current = false;
        }, 80);
      }
      dragRef.current.moved = false;
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", end);
      el.removeEventListener("pointercancel", end);
    };
  }, [n, scheduleUpdate]);

  const onLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (suppressNavRef.current) {
      e.preventDefault();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.min(el.clientWidth * 0.55, 420);
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const delta = e.key === "ArrowRight" ? step : -step;
      el.scrollBy({ left: delta, behavior: reducedMotion ? "auto" : "smooth" });
    }
  };

  if (n === 0) {
    return (
      <div className="flex min-h-[calc(100dvh-6rem)] flex-col items-center justify-center px-6 text-center">
        <p className="font-display text-2xl text-herbal-900">אין מטפלים רשומים עדיין</p>
        <p className="mt-3 max-w-md text-slate-600">חזרו מאוחר יותר או צרו קשר עם המנהלים.</p>
      </div>
    );
  }

  return (
    <section className="flex min-h-[calc(100dvh-5.5rem)] flex-col" aria-label="מדריך מטפלים — תצוגת קרוסלה">
      <header className="shrink-0 px-4 pb-2 pt-4 text-center sm:px-8 sm:pb-4">
        <h1 className="font-display text-3xl font-bold text-herbal-900 sm:text-4xl">מטפלים רשומים</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
          גרירה או מעקב אופקי — בחרו מטפל/ת ולחצו לדף הנחיתה המלא.
        </p>
      </header>

      <div
        ref={scrollRef}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="קרוסלת מטפלים"
        onKeyDown={onKeyDown}
        dir="ltr"
        className="showcase-scroll flex min-h-0 flex-1 cursor-grab touch-pan-x items-center gap-6 overflow-x-auto overflow-y-hidden overscroll-x-contain px-0 pb-10 pt-2 [-webkit-overflow-scrolling:touch] focus:outline-none focus-visible:ring-2 focus-visible:ring-herbal-500 focus-visible:ring-offset-2 sm:gap-8 sm:pb-14"
        style={{
          scrollSnapType: "x mandatory",
          scrollPaddingInline: SCROLL_SIDE_PAD,
        }}
      >
        <div
          aria-hidden
          className="shrink-0 snap-none"
          style={{ minWidth: SCROLL_SIDE_PAD, scrollSnapAlign: "none" }}
        />
        {items.map((t, i) => {
          const v = visuals[i] ?? { parallaxX: 0 };
          return (
            <article
              key={t.slug}
              data-showcase-card={i}
              className="w-[min(82vw,400px)] shrink-0 snap-center"
            >
              <Link
                href={`/t/${t.slug}`}
                onClick={onLinkClick}
                className="group block h-[clamp(440px,min(64vh,620px),620px)] w-full overflow-hidden rounded-[1.75rem] border border-white/20 bg-herbal-900/30 shadow-[0_28px_56px_-18px_rgba(36,63,39,0.45)] ring-1 ring-black/10 transition-shadow duration-500 hover:shadow-[0_36px_72px_-20px_rgba(0,0,0,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-herbal-400 focus-visible:ring-offset-4 sm:rounded-[2rem]"
              >
                <div className="relative h-full w-full overflow-hidden">
                  <div className="absolute inset-0 overflow-hidden">
                    {t.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.image}
                        alt=""
                        className="therapist-photo-bw h-[112%] w-[112%] max-w-none object-cover object-center contrast-[1.06]"
                        style={{
                          transform: `translateX(${v.parallaxX}px) translateY(${v.parallaxX * 0.1}px)`,
                          willChange: reducedMotion ? undefined : "transform",
                        }}
                        draggable={false}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-herbal-800 to-herbal-950 text-[clamp(3rem,18vw,5.5rem)] font-bold text-white/25">
                        {t.name.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/78 via-black/20 to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-right sm:p-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-200/95">מטפל/ת</p>
                    <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-white drop-shadow-md sm:text-3xl">
                      {t.name}
                    </h2>
                    <p className="mt-2 text-xs font-medium leading-snug text-white/92 sm:text-sm">{specialtyLine(t)}</p>
                    <p className="mt-4 text-xs font-semibold text-emerald-200/90">לחצו לדף מלא ←</p>
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
        <div
          aria-hidden
          className="shrink-0 snap-none"
          style={{ minWidth: SCROLL_SIDE_PAD, scrollSnapAlign: "none" }}
        />
      </div>

      {n > 1 && (
        <div className="flex justify-center gap-2 pb-2">
          {items.map((item, idx) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => {
                scrollRef.current?.querySelector<HTMLElement>(`[data-showcase-card="${idx}"]`)?.scrollIntoView({
                  inline: "center",
                  block: "nearest",
                  behavior: reducedMotion ? "auto" : "smooth",
                });
                setActiveIndex(idx);
              }}
              className={`h-2 rounded-full transition-all ${
                idx === activeIndex ? "w-9 bg-herbal-600" : "w-2 bg-herbal-200 hover:bg-herbal-400"
              }`}
              aria-label={`מטפל ${idx + 1}`}
              aria-current={idx === activeIndex ? "true" : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
