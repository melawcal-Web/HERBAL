import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { audienceLabels } from "@/lib/content-audience";
import { parseProductAudience, productTypeLabel } from "@/lib/product-metadata";
import { AddProductForm } from "./add-product-form";
import { ProductActiveToggle } from "./product-active-toggle";

export const metadata = {
  title: "מוצרים — ניהול",
};

export const dynamic = "force-dynamic";

function money(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(v);
}

export default async function AdminProductsPage() {
  const [products, therapists] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        therapist: { select: { id: true, name: true } },
      },
    }),
    prisma.user.findMany({
      where: {
        OR: [{ role: "therapist" }, { therapistProfile: { isNot: null } }],
      },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-xl font-bold text-herbal-900 sm:text-2xl">מוצרים ותוכן דיגיטלי</h2>
        <p className="mt-2 text-sm text-slate-600">
          רשימת כל המוצרים במערכת. ניתן לערוך שדות, להשבית פריט מהאתר הציבורי, או להוסיף חומר דיגיטלי חדש.
        </p>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-herbal-100 bg-white/90 shadow-sm">
          <table className="w-full min-w-[820px] text-right text-sm">
            <thead>
              <tr className="border-b border-herbal-100 bg-herbal-50/80 text-xs uppercase tracking-wide text-slate-600">
                <th className="px-4 py-3 font-semibold">כותרת</th>
                <th className="px-4 py-3 font-semibold">סוג</th>
                <th className="px-4 py-3 font-semibold">מחיר</th>
                <th className="px-4 py-3 font-semibold">קהל</th>
                <th className="px-4 py-3 font-semibold">מטפל/ת</th>
                <th className="px-4 py-3 font-semibold">סטטוס</th>
                <th className="px-4 py-3 font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-herbal-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-herbal-50/40">
                  <td className="px-4 py-3 font-medium text-herbal-900">
                    {p.title}
                    {p.catalogKey ? (
                      <span className="mr-2 block text-[11px] font-normal text-slate-400">קטלוג</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{productTypeLabel(p.type)}</td>
                  <td className="px-4 py-3 text-slate-700">{money(p.price)}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {audienceLabels(parseProductAudience(p.audience)) || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{p.therapist?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.active
                          ? "rounded-full bg-herbal-100 px-2 py-0.5 text-xs font-semibold text-herbal-800"
                          : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600"
                      }
                    >
                      {p.active ? "פעיל" : "מושבת"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="rounded-lg border border-herbal-200 bg-white px-3 py-1.5 text-xs font-semibold text-herbal-900 hover:bg-herbal-50"
                      >
                        עריכה
                      </Link>
                      <ProductActiveToggle productId={p.id} active={p.active} title={p.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">אין מוצרים במערכת עדיין.</p>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-herbal-200/80 bg-white/90 p-5 shadow-sm sm:p-7">
        <h3 className="font-display text-lg font-bold text-herbal-900">הוספת מוצר / חומר דיגיטלי</h3>
        <p className="mt-2 text-sm text-slate-600">
          סוג, תיאור, קהל יעד, מטפל/ת וקישור הורדה. פריט פעיל יופיע בדף קורסים וסדנאות לפי קהל היעד שנבחר.
        </p>
        <AddProductForm therapists={therapists} mode="create" />
      </section>
    </div>
  );
}
