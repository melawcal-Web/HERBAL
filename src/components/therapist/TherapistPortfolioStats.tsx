type Stats = {
  articles: number;
  courses: number;
  recipes: number;
  lectures: number;
};

export function TherapistPortfolioStats({ stats }: { stats: Stats }) {
  const items = [
    { label: "מאמרים", value: stats.articles },
    { label: "קורסים", value: stats.courses },
    { label: "מתכונים", value: stats.recipes },
    { label: "הרצאות", value: stats.lectures },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-herbal-100 bg-herbal-50/50 px-4 py-4 text-center shadow-sm"
        >
          <p className="font-display text-2xl font-bold text-herbal-700">{item.value}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-herbal-800/80">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
