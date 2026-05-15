import { formatTimelineYears, type PortfolioTimelineEntry } from "@/lib/portfolio-timeline";

export function TherapistPortfolioTimeline({ entries }: { entries: PortfolioTimelineEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="timeline-heading">
      <p id="timeline-heading" className="text-[11px] font-bold uppercase tracking-[0.36em] text-herbal-800/80">
        ניסיון והשכלה
      </p>
      <ul className="mt-5 space-y-3 rounded-2xl bg-neutral-900 px-5 py-6 sm:px-8 sm:py-7">
        {entries.map((e) => {
          const years = formatTimelineYears(e);
          return (
            <li key={e.id} className="text-base leading-relaxed text-white">
              {years ? <span className="italic font-medium">{years}</span> : null}
              {years ? <span className="mx-2 text-white/60">—</span> : null}
              <span>{e.description}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
