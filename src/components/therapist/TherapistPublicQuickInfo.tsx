import { formatTimelineYears, type PortfolioTimelineEntry } from "@/lib/portfolio-timeline";

function clip(s: string, max: number) {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/**
 * כרטיס מידע ציבורי — רקע "עולם צמחים", נתונים יבשים ותקציר תקופות (לא הביוגרפיה המלאה).
 */
export function TherapistPublicQuickInfo({
  roleLabel,
  therapistName,
  city,
  specialties,
  portfolioTimeline,
  clinicalTeaser,
}: {
  roleLabel: string;
  therapistName: string;
  city: string | null;
  specialties: string[];
  portfolioTimeline: PortfolioTimelineEntry[];
  clinicalTeaser: string | null;
}) {
  return (
    <div className="relative z-20 -mt-6 mx-auto w-full max-w-5xl px-3 sm:-mt-10 sm:px-5">
      <div
        className="overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-teal-50/95 to-lime-50/90 p-5 shadow-[0_20px_50px_-24px_rgba(16,120,72,0.45)] sm:rounded-[2rem] sm:p-8"
        dir="rtl"
      >
        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-lime-300/25 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-12 -right-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" aria-hidden />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-900/70">{roleLabel}</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-emerald-950 sm:text-3xl">{therapistName}</h2>
            {city ? <p className="mt-2 text-sm font-semibold text-emerald-900/85">{city}</p> : null}

            {specialties.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {specialties.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-emerald-300/60 bg-white/70 px-3 py-1 text-xs font-semibold text-emerald-900 shadow-sm backdrop-blur-sm"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="min-w-0 flex-1 rounded-2xl border border-white/60 bg-white/45 p-4 backdrop-blur-sm sm:max-w-[min(100%,24rem)]">
            {portfolioTimeline.length > 0 ? (
              <>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-900/65">ציר זמן — תקופות</p>
                <ul className="mt-3 space-y-2 text-sm text-emerald-950">
                  {portfolioTimeline.map((e) => (
                    <li key={e.id} className="flex flex-wrap items-baseline gap-2 border-b border-emerald-200/40 pb-2 last:border-0 last:pb-0">
                      <span className="font-mono text-xs font-bold text-emerald-800" dir="ltr">
                        {formatTimelineYears(e) || "—"}
                      </span>
                      {e.description.trim() ? (
                        <span className="text-xs leading-snug text-emerald-900/90">{clip(e.description, 72)}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-emerald-900/75">אין תקופות שסומנו בציר הזמן.</p>
            )}

            {clinicalTeaser ? (
              <div className="mt-4 border-t border-emerald-200/50 pt-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-900/65">ניסיון והשכלה — תקציר</p>
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-emerald-900/88">{clinicalTeaser}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
