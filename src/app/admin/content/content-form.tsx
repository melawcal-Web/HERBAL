"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { VisionSlide, HomeHeroCopy } from "@/lib/home-vision";
import { updateSiteTitle, updateVisionSlides, updateHomeHeroCopy } from "@/app/actions/site-config";
import { ImagePicker } from "@/components/dashboard/ImagePicker";

function cloneSlides(s: VisionSlide[]): VisionSlide[] {
  return s.map((x) => ({ ...x }));
}

function newSlideId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `viz-${crypto.randomUUID()}`;
  }
  return `viz-${Date.now()}`;
}

export function ContentSettingsForm({
  initialTitle,
  initialSlides,
  initialHomeHero,
}: {
  initialTitle: string;
  initialSlides: VisionSlide[];
  initialHomeHero: HomeHeroCopy;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [heroMain, setHeroMain] = useState(initialHomeHero.mainTitle);
  const [heroHeadline, setHeroHeadline] = useState(initialHomeHero.headline);
  const [heroSliderHint, setHeroSliderHint] = useState(initialHomeHero.sliderHint);
  const [slides, setSlides] = useState(() => cloneSlides(initialSlides));
  const [msgTitle, setMsgTitle] = useState<string | null>(null);
  const [msgHero, setMsgHero] = useState<string | null>(null);
  const [msgSlides, setMsgSlides] = useState<string | null>(null);
  const [pendingTitle, startTitle] = useTransition();
  const [pendingHero, startHero] = useTransition();
  const [pendingSlides, startSlides] = useTransition();

  function patchSlide(i: number, patch: Partial<VisionSlide>) {
    setSlides((prev) => {
      const next = [...prev];
      const cur = next[i];
      if (!cur) return prev;
      next[i] = { ...cur, ...patch };
      return next;
    });
  }

  function addSlide() {
    setSlides((prev) => [
      ...prev,
      {
        id: newSlideId(),
        eyebrow: "",
        title: "שקופית חדשה",
        body: "עריכת תיאור כאן.",
        imageUrl: null,
        gradientFrom: "#f0faf0",
        gradientTo: "#d4ead6",
      },
    ]);
    setMsgSlides(null);
  }

  function removeSlide(i: number) {
    if (slides.length <= 1) {
      setMsgSlides("חובה לפחות שקופית אחת.");
      return;
    }
    setSlides((prev) => prev.filter((_, j) => j !== i));
    setMsgSlides(null);
  }

  function moveSlide(i: number, dir: -1 | 1) {
    setSlides((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const cp = [...prev];
      const [row] = cp.splice(i, 1);
      cp.splice(j, 0, row!);
      return cp;
    });
  }

  function saveHomeHero() {
    setMsgHero(null);
    startHero(async () => {
      try {
        await updateHomeHeroCopy({
          mainTitle: heroMain,
          headline: heroHeadline,
          sliderHint: heroSliderHint,
        });
        setMsgHero("טקסטי ה-Hero נשמרו והאתר עודכן.");
        router.refresh();
      } catch (e) {
        setMsgHero(e instanceof Error ? e.message : "שגיאה");
      }
    });
  }

  function saveTitleOnly() {
    setMsgTitle(null);
    startTitle(async () => {
      try {
        await updateSiteTitle(title);
        setMsgTitle("הכותרת נשמרה.");
        router.refresh();
      } catch (e) {
        setMsgTitle(e instanceof Error ? e.message : "שגיאה");
      }
    });
  }

  function saveSlidesOnly() {
    setMsgSlides(null);
    const trimmed = slides.map((s) => ({ ...s, id: s.id.trim() }));
    const ids = new Set(trimmed.map((s) => s.id));
    if (ids.size !== trimmed.length) {
      setMsgSlides("כל שקופית חייבת מזהה ייחודי.");
      return;
    }
    for (const s of trimmed) {
      if (!s.id || !s.title.trim() || !s.body.trim()) {
        setMsgSlides("מזהה, כותרת ותיאור נדרשים בכל שקופית.");
        return;
      }
    }
    startSlides(async () => {
      try {
        await updateVisionSlides(trimmed);
        setMsgSlides("השקופיות נשמרו והאתר עודכן.");
        router.refresh();
      } catch (e) {
        setMsgSlides(e instanceof Error ? e.message : "שגיאה");
      }
    });
  }

  return (
    <div className="space-y-12">
      <section className="rounded-2xl border border-herbal-200/80 bg-white/90 p-5 shadow-sm sm:p-7">
        <h3 className="font-display text-lg font-bold text-herbal-900">הגדרות כלליות</h3>
        <p className="mt-1 text-xs text-slate-500">כותרת האתר בכותרת העליונה (לוגו טקסט).</p>
        <div className="mt-4 space-y-2">
          <label htmlFor="site-title" className="block text-sm font-semibold text-herbal-900">
            כותרת האתר (ניווט עליון)
          </label>
          <input
            id="site-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full max-w-full rounded-xl border border-herbal-200 bg-white px-4 py-3 text-right text-sm text-herbal-950 shadow-inner outline-none transition focus:border-herbal-500"
            dir="rtl"
            maxLength={255}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={saveTitleOnly}
            disabled={pendingTitle}
            className="rounded-xl border border-herbal-600 bg-herbal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-herbal-700 disabled:opacity-60"
          >
            {pendingTitle ? "שומר…" : "שמור כותרת"}
          </button>
          {msgTitle && <p className="text-sm text-slate-700">{msgTitle}</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-herbal-200/80 bg-white/90 p-5 shadow-sm sm:p-7">
        <h3 className="font-display text-lg font-bold text-herbal-900">טקסטים — אזור החזון בדף הבית</h3>
        <p className="mt-1 text-xs text-slate-500">
          השורות מעל ומתחת לסליידר החזון. נשמרות במסד הנתונים ומתעדכנות בדף הראשי לאחר שמירה.
        </p>
        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <label htmlFor="hero-main" className="block text-sm font-semibold text-herbal-900">
              כותרת ראשית
            </label>
            <p className="text-[11px] text-slate-500">למשל: המרכז למטפלים בצמחי מרפא — שורה קטנה מעל כותרת המשנה.</p>
            <input
              id="hero-main"
              type="text"
              value={heroMain}
              onChange={(e) => setHeroMain(e.target.value)}
              className="w-full max-w-full rounded-xl border border-herbal-200 bg-white px-4 py-3 text-right text-sm text-herbal-950 shadow-inner outline-none transition focus:border-herbal-500"
              dir="rtl"
              maxLength={255}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="hero-headline" className="block text-sm font-semibold text-herbal-900">
              כותרת משנה
            </label>
            <p className="text-[11px] text-slate-500">למשל: חזון, ערכים ומה מחכה לכם כאן — הכותרת הגדולה מעל הסליידר.</p>
            <input
              id="hero-headline"
              type="text"
              value={heroHeadline}
              onChange={(e) => setHeroHeadline(e.target.value)}
              className="w-full max-w-full rounded-xl border border-herbal-200 bg-white px-4 py-3 text-right text-sm text-herbal-950 shadow-inner outline-none transition focus:border-herbal-500"
              dir="rtl"
              maxLength={500}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="hero-slider-hint" className="block text-sm font-semibold text-herbal-900">
              הנחיות לסליידר
            </label>
            <p className="text-[11px] text-slate-500">למשל: הזיזו בגרירה או עם החיצים… — טקסט עזר מתחת לכותרת המשנה.</p>
            <textarea
              id="hero-slider-hint"
              value={heroSliderHint}
              onChange={(e) => setHeroSliderHint(e.target.value)}
              rows={3}
              className="w-full max-w-full resize-y rounded-xl border border-herbal-200 bg-white px-4 py-3 text-right text-sm text-herbal-950 shadow-inner outline-none transition focus:border-herbal-500"
              dir="rtl"
              maxLength={600}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={saveHomeHero}
            disabled={pendingHero}
            className="rounded-xl border border-herbal-600 bg-herbal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-herbal-700 disabled:opacity-60"
          >
            {pendingHero ? "שומר…" : "שמור טקסטי Hero"}
          </button>
          {msgHero && <p className="text-sm text-slate-700">{msgHero}</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-herbal-200/80 bg-white/90 p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold text-herbal-900">מנהל שקופיות (Hero)</h3>
            <p className="mt-1 text-xs text-slate-500">
              יצירה, מחיקה, סידור, עריכת טקסט/צבעים/תמונה. עד 12 שקופיות.
            </p>
          </div>
          <button
            type="button"
            onClick={addSlide}
            disabled={slides.length >= 12}
            className="rounded-xl border border-emerald-400 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-100 disabled:opacity-50"
          >
            + הוספת שקופית
          </button>
        </div>

        <div className="mt-8 space-y-8">
          {slides.map((s, i) => (
            <fieldset
              key={s.id}
              className="space-y-3 rounded-xl border border-herbal-100/90 bg-herbal-50/40 p-4 text-right"
            >
              <legend className="flex w-full flex-wrap items-center justify-between gap-2 px-1 text-xs font-bold uppercase tracking-wide text-herbal-700">
                <span>
                  שקופית {i + 1}{" "}
                  <span className="font-mono font-normal text-slate-500">({s.id})</span>
                </span>
                <span className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    className="rounded-lg border border-herbal-200 bg-white px-2 py-1 text-[11px] font-semibold text-herbal-800 disabled:opacity-40"
                    onClick={() => moveSlide(i, -1)}
                    disabled={i === 0}
                    aria-label="הזזה למעלה"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-herbal-200 bg-white px-2 py-1 text-[11px] font-semibold text-herbal-800 disabled:opacity-40"
                    onClick={() => moveSlide(i, 1)}
                    disabled={i === slides.length - 1}
                    aria-label="הזזה למטה"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-900 disabled:opacity-40"
                    onClick={() => removeSlide(i)}
                    disabled={slides.length <= 1}
                  >
                    מחק
                  </button>
                </span>
              </legend>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">מזהה (ייחודי)</label>
                  <input
                    type="text"
                    value={s.id}
                    onChange={(e) => patchSlide(i, { id: e.target.value })}
                    className="w-full max-w-full rounded-lg border border-herbal-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-herbal-500"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">שורת עליונה (אופציונלי)</label>
                  <input
                    type="text"
                    value={s.eyebrow ?? ""}
                    onChange={(e) => patchSlide(i, { eyebrow: e.target.value })}
                    className="w-full max-w-full rounded-lg border border-herbal-200 bg-white px-3 py-2 text-sm outline-none focus:border-herbal-500"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">כותרת</label>
                <input
                  type="text"
                  value={s.title}
                  onChange={(e) => patchSlide(i, { title: e.target.value })}
                  className="w-full max-w-full rounded-lg border border-herbal-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-herbal-500"
                  dir="rtl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">תיאור</label>
                <textarea
                  value={s.body}
                  onChange={(e) => patchSlide(i, { body: e.target.value })}
                  rows={3}
                  className="w-full max-w-full resize-y rounded-lg border border-herbal-200 bg-white px-3 py-2 text-sm outline-none focus:border-herbal-500"
                  dir="rtl"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">צבע רקע התחלה</label>
                  <input
                    type="text"
                    value={s.gradientFrom ?? ""}
                    onChange={(e) => patchSlide(i, { gradientFrom: e.target.value || null })}
                    placeholder="#f0faf0"
                    className="w-full max-w-full rounded-lg border border-herbal-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-herbal-500"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">צבע רקע סיום</label>
                  <input
                    type="text"
                    value={s.gradientTo ?? ""}
                    onChange={(e) => patchSlide(i, { gradientTo: e.target.value || null })}
                    placeholder="#c8e6c9"
                    className="w-full max-w-full rounded-lg border border-herbal-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-herbal-500"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">כתובת תמונה (https) — אופציונלי</label>
                <input
                  type="url"
                  value={s.imageUrl ?? ""}
                  onChange={(e) => patchSlide(i, { imageUrl: e.target.value.trim() || null })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full max-w-full rounded-lg border border-herbal-200 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-herbal-500"
                  dir="ltr"
                />
              </div>

              <ImagePicker
                label="תמונת שקופית"
                value={s.imageUrl ?? ""}
                onChange={(url) => patchSlide(i, { imageUrl: url })}
                uploadPrefix="content"
              />
            </fieldset>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-herbal-100 pt-6">
          <button
            type="button"
            onClick={saveSlidesOnly}
            disabled={pendingSlides}
            className="btn-shimmer min-h-[44px] rounded-xl px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {pendingSlides ? "שומר…" : "שמור שקופיות ועדכן את האתר"}
          </button>
          {msgSlides && <p className="text-sm text-slate-700">{msgSlides}</p>}
        </div>
      </section>
    </div>
  );
}
