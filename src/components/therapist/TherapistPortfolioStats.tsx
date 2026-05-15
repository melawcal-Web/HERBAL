import Link from "next/link";
import { therapistContentHref, type PortfolioContentKind } from "@/lib/therapist-portfolio-content";

type Stats = {
  articles: number;
  courses: number;
  recipes: number;
  lectures: number;
};

const STAT_KEYS: { kind: PortfolioContentKind; label: string; key: keyof Stats }[] = [
  { kind: "articles", label: "מאמרים", key: "articles" },
  { kind: "courses", label: "קורסים", key: "courses" },
  { kind: "recipes", label: "מתכונים", key: "recipes" },
  { kind: "lectures", label: "הרצאות", key: "lectures" },
];

export function TherapistPortfolioStats({
  stats,
  therapistProfileId,
}: {
  stats: Stats;
  therapistProfileId: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STAT_KEYS.map((item) => (
        <Link
          key={item.kind}
          href={therapistContentHref(therapistProfileId, item.kind)}
          className="group rounded-2xl border border-herbal-100 bg-herbal-50/50 px-4 py-4 text-center shadow-sm transition hover:border-herbal-300 hover:bg-white hover:shadow-md"
        >
          <p className="font-display text-2xl font-bold text-herbal-700 transition group-hover:text-herbal-900">
            {stats[item.key]}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-herbal-800/80 group-hover:text-herbal-900">
            {item.label}
          </p>
        </Link>
      ))}
    </div>
  );
}
