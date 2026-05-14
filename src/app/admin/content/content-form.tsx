"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { VisionSlide } from "@/lib/home-vision";
import { updateSiteTitle, updateVisionSlides } from "@/app/actions/site-config";

function cloneSlides(s: VisionSlide[]): VisionSlide[] {
  return s.map((x) => ({ ...x }));
}

export function ContentSettingsForm({
  initialTitle,
  initialSlides,
}: {
  initialTitle: string;
  initialSlides: VisionSlide[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [slides, setSlides] = useState(() => cloneSlides(initialSlides));
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function patchSlide(i: number, patch: Partial<VisionSlide>) {
    setSlides((prev) => {
      const next = [...prev];
      const cur = next[i];
      if (!cur) return prev;
      next[i] = { ...cur, ...patch };
      return next;
    });
  }

  function save() {
    setMsg(null);
    startTransition(async () => {
      try {
        await updateSiteTitle(title);
        await updateVisionSlides(slides);
        setMsg("נשמר והאתר עודכן.");
        router.refresh();
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "שגיאה");
      }
    });
  }

  return (
    <div className="space-y-10 rounded-2xl border border-herbal-100 bg-white/85 p-5 shadow-sm sm:p-7">
      <div className="space-y-2">
        <label htmlFor="site-title" className="block text-sm font-semibold text-herbal-900">
          כותרת האתר (לוגו טקסט)
        </label>
        <input
          id="site-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full max-w-full rounded-xl border border-herbal-200 bg-white px-4 py-3 text-right text-sm text-herbal-950 shadow-inner outline-none ring-0 transition focus:border-herbal-500"
          dir="rtl"
          maxLength={255}
        />
      </div>

      <div className="space-y-6">
        <p className="text-sm font-semibold text-herbal-900">שקופיות דף הבית (רקע + טקסט)</p>
        <p className="text-xs text-slate-500">
          צבעים בפורמט <span className="font-mono">#RRGGBB</span> (אופציונלי לכל שקופית — ברירת מחדל רכה אם ריק).
        </p>

        <div className="space-y-8">
          {slides.map((s, i) => (
            <fieldset
              key={s.id}
              className="space-y-3 rounded-xl border border-herbal-100/90 bg-herbal-50/40 p-4 text-right"
            >
              <legend className="px-1 text-xs font-bold uppercase tracking-wide text-herbal-700">
                שקופית {i + 1}{" "}
                <span className="font-mono font-normal text-slate-500">({s.id})</span>
              </legend>

              <div className="grid gap-3 sm:grid-cols-2">
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
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">מזהה פנימי (לא לשנות)</label>
                  <input
                    type="text"
                    value={s.id}
                    readOnly
                    className="w-full max-w-full cursor-not-allowed rounded-lg border border-herbal-100 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                    dir="ltr"
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
            </fieldset>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="btn-shimmer min-h-[44px] rounded-xl px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {pending ? "שומר…" : "שמירה ועדכון האתר"}
        </button>
        {msg && <p className="text-sm text-slate-700">{msg}</p>}
      </div>
    </div>
  );
}
