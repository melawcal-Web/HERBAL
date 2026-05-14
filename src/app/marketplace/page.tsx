import { prisma } from "@/lib/prisma";
import type { ProductType } from "@prisma/client";
import { parseProductMetadata } from "@/lib/product-metadata";

export const metadata = {
  title: "קורסים וסדנאות",
};

function money(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" }).format(v);
}

function typeHebrew(t: ProductType): string {
  switch (t) {
    case "zoom":
      return "זום";
    case "workshop":
      return "קורס פרונטלי / סדנה";
    case "supervision":
      return "השגחה";
    case "shelf_product":
      return "מוצר מהמדף";
    default:
      return "קורסים וסדנאות";
  }
}

function formatWhen(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("he-IL", { dateStyle: "medium", timeStyle: "short" });
}

export default async function MarketplacePage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-herbal-900">קורסים וסדנאות</h1>
      <p className="mt-2 text-slate-600">סדנאות פרונטליות, מפגשי זום והשגחה מקצועית — מחיר מלא ומחיר חברים.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {products.map((p) => {
          const meta = parseProductMetadata(p.metadata);
          const when = formatWhen(meta.startsAt);
          return (
            <article
              key={p.id}
              className="flex flex-col rounded-2xl border border-herbal-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-sage">{typeHebrew(p.type)}</p>
              <h2 className="mt-2 text-xl font-semibold text-herbal-900">{p.title}</h2>
              <p className="mt-2 flex-1 text-slate-600">{p.description}</p>
              {meta.courseDetails ? (
                <div className="mt-3 rounded-xl border border-herbal-100 bg-herbal-50/50 p-3 text-sm leading-relaxed text-slate-700">
                  <p className="text-xs font-bold uppercase tracking-wide text-herbal-800/90">פירוט</p>
                  <p className="mt-2 whitespace-pre-wrap">{meta.courseDetails}</p>
                </div>
              ) : null}
              {when || meta.location || meta.zoomUrl || meta.maxParticipants != null ? (
                <ul className="mt-3 space-y-1 text-sm text-slate-600">
                  {when ? <li>מועד: {when}</li> : null}
                  {meta.location ? <li>מיקום: {meta.location}</li> : null}
                  {meta.zoomUrl ? (
                    <li>
                      זום:{" "}
                      <a className="font-medium text-herbal-800 underline" href={meta.zoomUrl} target="_blank" rel="noopener noreferrer">
                        קישור למפגש
                      </a>
                    </li>
                  ) : null}
                  {meta.maxParticipants != null ? <li>עד {meta.maxParticipants} משתתפים</li> : null}
                </ul>
              ) : null}
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
          );
        })}
      </div>
      {products.length === 0 && <p className="mt-6 text-slate-600">אין פריטים פעילים עדיין.</p>}
    </div>
  );
}
