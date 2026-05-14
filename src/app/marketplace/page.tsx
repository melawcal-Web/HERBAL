import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "קורסים וסדנאות",
};

function money(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" }).format(v);
}

export default async function MarketplacePage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-herbal-900">קורסים וסדנאות</h1>
      <p className="mt-2 text-slate-600">סדנאות, זום, השגחה ומוצרי מדף — מחיר מלא ומחיר חברים.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {products.map((p) => (
          <article
            key={p.id}
            className="flex flex-col rounded-2xl border border-herbal-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-sage">{p.type}</p>
            <h2 className="mt-2 text-xl font-semibold text-herbal-900">{p.title}</h2>
            <p className="mt-2 flex-1 text-slate-600">{p.description}</p>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-2 border-t border-herbal-100 pt-4">
              <div>
                <p className="text-sm text-slate-500">מחיר</p>
                <p className="text-lg font-semibold">{money(p.price)}</p>
              </div>
              <div className="text-left">
                <p className="text-sm text-slate-500">מחיר חברים</p>
                <p className="text-lg font-semibold text-herbal-700">{money(p.memberPrice)}</p>
              </div>
            </div>
            <button
              type="button"
              className="mt-4 min-h-[48px] w-full rounded-full bg-herbal-600 py-3 text-white hover:bg-herbal-500"
            >
              רכישה (חיבור סליקה ב-DEPLOY)
            </button>
          </article>
        ))}
      </div>
      {products.length === 0 && <p className="mt-6 text-slate-600">אין מוצרים פעילים עדיין.</p>}
    </div>
  );
}
