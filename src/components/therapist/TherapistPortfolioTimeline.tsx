import type { PortfolioTimelineEntry } from "@/lib/portfolio-timeline";

export function TherapistPortfolioTimeline({ entries }: { entries: PortfolioTimelineEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="timeline-heading">
      <p id="timeline-heading" className="text-[11px] font-bold uppercase tracking-[0.36em] text-herbal-800/80">
        ניסיון והשכלה
      </p>
      <ol className="mt-5 space-y-4 border-s-2 border-herbal-200 ps-5">
        {entries.map((e) => (
          <li key={e.id} className="relative">
            <span className="absolute -start-[1.65rem] top-1.5 h-2.5 w-2.5 rounded-full bg-herbal-500 ring-4 ring-white" />
            <p className="text-sm font-bold text-herbal-800">
              {e.yearFrom}
              {e.yearTo ? ` – ${e.yearTo}` : " – היום"}
            </p>
            <p className="mt-1 text-base leading-relaxed text-neutral-700 whitespace-pre-wrap">{e.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
