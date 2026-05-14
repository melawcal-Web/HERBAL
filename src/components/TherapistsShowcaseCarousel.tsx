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

/** Distance from viewport center → 0 at center, ~1 when slide is half a viewport away */
function centerNorm(root: DOMRect, slide: DOMRect): number {
  const rootCx = root.left + root.width / 2;
  const slideCx = slide.left + slide.width / 2;
  return Math.min(1, Math.abs(slideCx - rootCx) / Math.max(120, root.width * 0.42));
}

type SlideVisual = { scale: number; opacity: number; parallaxX: number };

export function TherapistsShowcaseCarousel({ items }: { items: TherapistShowcaseItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visuals, setVisuals] = useState<SlideVisual[]>(() => items.map(() => ({ scale: 1, opacity: 1, parallaxX: 0 })));
  const [reducedMotion, setReducedMotion] = useState(false);
  const suppressNavRef = useRef(false);
  const dragRef = useRef({ active: false, pointerId: 0, startX: 0, startScroll: 0, moved: false });
  const rafRef = useRef<number | null>(null);

  const n = items.length;

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
        next.push({ scale: 1 - norm * 0.06, opacity: 1 - norm * 0.25, parallaxX: 0 });
      } else {
        const scale = 1 - norm * 0.12;
        const opacity = 1 - norm * 0.42;
        const slideCx = r.left + r.width / 2;
        const rootCx = rootRect.left + rootRect.width / 2;
        const parallaxX = (slideCx - rootCx) * -0.14;
        next.push({ scale, opacity, parallaxX });
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

  const slugKey = items.map((x) => x.slug).join("|");

  useEffect(() => {
    setVisuals(items.map(() => ({ scale: 1, opacity: 1, parallaxX: 0 })));
  }, [slugKey]);

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

  /** Desktop: vertical wheel → horizontal scroll with eased feel */
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

  /** Mouse / pen drag to scroll (kinetic handoff to native momentum on touch) */
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
    <section
      className="flex min-h-[calc(100dvh-5.5rem)] flex-col"
      aria-label="מדריך מטפלים — תצוגת קרוסלה"
    >
      <header className="shrink-0 px-4 pb-2 pt-4 text-center sm:px-8 sm:pb-4 sm:text-right">
        <h1 className="font-display text-3xl font-bold text-herbal-900 sm:text-4xl">מטפלים רשומים</h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
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
        className="showcase-scroll flex min-h-0 flex-1 cursor-grab touch-pan-x items-center gap-6 overflow-x-auto overflow-y-hidden overscroll-x-contain px-4 pb-10 pt-2 [-webkit-overflow-scrolling:touch] focus:outline-none focus-visible:ring-2 focus-visible:ring-herbal-500 focus-visible:ring-offset-2 sm:gap-10 sm:px-8 sm:pb-14"
        style={{
          scrollSnapType: "x mandatory",
          scrollPaddingInline: "max(1rem, calc(50vw - min(40vw, 200px)))",
        }}
      >
        {items.map((t, i) => {
          const v = visuals[i] ?? { scale: 1, opacity: 1, parallaxX: 0 };
          return (
            <article
              key={t.slug}
              data-showcase-card
              className="flex w-[min(82vw,400px)] shrink-0 snap-center flex-col items-stretch sm:w-[min(72vw,440px)]"
              style={{
                transition: reducedMotion ? "none" : "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease",
                transform: `scale(${v.scale})`,
                opacity: v.opacity,
                willChange: reducedMotion ? undefined : "transform, opacity",
              }}
            >
              <Link
                href={`/t/${t.slug}`}
                onClick={onLinkClick}
                className="group block rounded-[1.75rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-herbal-400 focus-visible:ring-offset-4"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.75rem] border border-white/20 bg-herbal-900/30 shadow-[0_28px_56px_-18px_rgba(36,63,39,0.45)] ring-1 ring-black/10 transition-shadow duration-500 group-hover:shadow-[0_36px_72px_-20px_rgba(0,0,0,0.5)]">
                  <div className="absolute inset-0 overflow-hidden">
                    {t.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.image}
                        alt=""
                        className="therapist-photo-bw h-[112%] w-[112%] max-w-none object-cover object-center contrast-[1.06]"
                        style={{
                          transform: `translateX(${v.parallaxX}px) translateY(${v.parallaxX * 0.12}px)`,
                          willChange: reducedMotion ? undefined : "transform",
                        }}
                        draggable={false}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-herbal-800 to-herbal-950 text-[clamp(3rem,20vw,6rem)] font-bold text-white/25">
                        {t.name.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-90" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-right sm:p-6">
                    <h2 className="font-display text-2xl font-bold leading-tight text-white drop-shadow-md sm:text-3xl">{t.name}</h2>
                    <p className="mt-2 text-xs font-medium leading-snug text-white/90 sm:text-sm">{specialtyLine(t)}</p>
                  </div>
                </div>

                <div className="mt-4 px-1 text-right sm:mt-5">
                  <p className="font-display text-lg font-semibold text-herbal-900 sm:text-xl">{t.name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{specialtyLine(t)}</p>
                  <p className="mt-2 text-xs font-medium text-herbal-600 opacity-0 transition group-hover:opacity-100 sm:text-sm">
                    לדף הנחיתה ←
                  </p>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
