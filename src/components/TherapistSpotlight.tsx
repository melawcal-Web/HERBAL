"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export type SpotlightTherapist = {
  slug: string;
  name: string;
  image: string | null;
  bio: string;
  specialty1: string;
  specialty2: string;
  specialty3: string;
};

export function TherapistSpotlight({ therapists }: { therapists: SpotlightTherapist[] }) {
  const [i, setI] = useState(0);

  const n = therapists.length;
  const next = useCallback(() => setI((x) => (n ? (x + 1) % n : 0)), [n]);
  const prev = useCallback(() => setI((x) => (n ? (x - 1 + n) % n : 0)), [n]);

  useEffect(() => {
    if (n <= 1) return;
    const t = window.setInterval(next, 6000);
    return () => window.clearInterval(t);
  }, [n, next]);

  if (!n) {
    return (
      <section className="rounded-3xl border border-dashed border-herbal-200 bg-herbal-50/50 px-6 py-12 text-center text-slate-600">
        <p className="font-medium text-herbal-800">בקרוב — מטפלים יוצגו כאן</p>
        <p className="mt-2 text-sm">הריצו <code className="rounded bg-white px-1">npx prisma db seed</code> או פריסה עם seed כדי לראות דוגמאות.</p>
      </section>
    );
  }

  const t = therapists[i]!;

  return (
    <section className="overflow-hidden rounded-3xl border border-herbal-100 bg-gradient-to-br from-white via-herbal-50/80 to-sage/20 shadow-lg shadow-herbal-900/10">
      <div className="grid gap-0 md:grid-cols-2">
        <div className="relative aspect-[4/3] min-h-[220px] md:min-h-[320px]">
          {t.image ? (
            <Image
              src={t.image}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full min-h-[220px] items-center justify-center bg-herbal-100 text-6xl text-herbal-300 md:min-h-[320px]">
              {t.name.slice(0, 1)}
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
          <p className="absolute bottom-3 right-4 left-4 text-sm font-medium text-white drop-shadow md:text-base">
            {t.specialty1} · {t.specialty2} · {t.specialty3}
          </p>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-herbal-600">מטפל/ת מוביל/ת</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-herbal-900 sm:text-3xl">{t.name}</h2>
          <p className="mt-4 line-clamp-5 text-slate-700 leading-relaxed">{t.bio}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={`/t/${t.slug}`}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-herbal-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-herbal-500"
            >
              לדף הנחיתה
            </Link>
            <Link href="/therapists" className="text-sm font-medium text-herbal-700 underline-offset-4 hover:underline">
              כל המטפלים
            </Link>
          </div>

          {n > 1 && (
            <div className="mt-8 flex items-center justify-between gap-4 border-t border-herbal-100 pt-6">
              <button
                type="button"
                onClick={prev}
                className="rounded-full border border-herbal-200 bg-white px-4 py-2 text-sm text-herbal-800 transition hover:bg-herbal-50"
                aria-label="מטפל/ת קודם/ת"
              >
                ← הקודם
              </button>
              <div className="flex gap-1.5">
                {therapists.map((item, idx) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => setI(idx)}
                    className={`h-2.5 rounded-full transition-all ${idx === i ? "w-8 bg-herbal-600" : "w-2.5 bg-herbal-200 hover:bg-herbal-300"}`}
                    aria-label={`מטפל ${idx + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={next}
                className="rounded-full border border-herbal-200 bg-white px-4 py-2 text-sm text-herbal-800 transition hover:bg-herbal-50"
                aria-label="מטפל/ת הבא/ה"
              >
                הבא →
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
