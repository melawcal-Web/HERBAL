import Link from "next/link";
import { ExploreCardImage } from "@/components/home/HomeExploreGrid";

export type HomeTherapistCard = {
  id: string;
  name: string;
  /** סוג טיפול / כותרת מקצועית */
  roleLabel: string;
  /** תחומי התמחות (מומחיות) */
  specialties: string;
  href: string;
  imageUrl: string | null;
};

const DISPLAY_COUNT = 4;

export function HomeTherapistsRandomGrid({ therapists }: { therapists: HomeTherapistCard[] }) {
  const shown = therapists.slice(0, DISPLAY_COUNT);

  if (shown.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-herbal-200 bg-white/60 py-10 text-center text-slate-600">
        אין מטפלים רשומים להצגה כרגע.
      </p>
    );
  }

  return (
    <section className="mt-0 w-full max-w-full" aria-labelledby="home-therapists-label">
      <div className="mx-auto w-full max-w-[1320px]">
        <h2 id="home-therapists-label" className="mb-6 text-center font-display text-2xl font-bold text-herbal-900 sm:text-right sm:text-3xl">
          מטפלים
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {shown.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group relative overflow-hidden rounded-2xl border border-herbal-100/90 bg-white/90 shadow-glass transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none hover:-translate-y-1 hover:border-herbal-200 hover:shadow-lift"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-herbal-50">
                <ExploreCardImage imageUrl={item.imageUrl} placeholderSeed={item.id} variant="therapist" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 text-right text-white sm:p-4" dir="rtl">
                  <h3 className="font-display text-base font-bold leading-snug drop-shadow-md sm:text-lg">{item.name}</h3>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-100/95 sm:text-xs">
                    {item.roleLabel}
                  </p>
                  {item.specialties ? (
                    <p className="mt-1.5 line-clamp-3 text-[11px] leading-relaxed text-white/90 sm:text-xs">{item.specialties}</p>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-slate-600 sm:text-right">
          <Link href="/therapists" className="font-semibold text-herbal-700 underline-offset-4 hover:underline">
            לצפייה בכל המטפלים
          </Link>
        </p>
      </div>
    </section>
  );
}
