import { prisma } from "@/lib/prisma";

export default async function AdminLogPage() {
  const [users, therapists, logs, products, audits] = await Promise.all([
    prisma.user.count(),
    prisma.therapistProfile.count(),
    prisma.clinicalLog.count(),
    prisma.product.count(),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      include: { actor: { select: { name: true, email: true } } },
    }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-2xl text-herbal-900">לוג ותמונת מצב</h2>
        <p className="mt-1 text-slate-600">ספירות, תשלומים (מקום), ויומן ביקורת.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "משתמשים", value: users },
          { label: "מטפלים (פרופילים)", value: therapists },
          { label: "רישומי EMR", value: logs },
          { label: "רישומי קורסים וסדנאות (מוצרים)", value: products },
        ].map((c) => (
          <article key={c.label} className="glass-panel p-5">
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold text-herbal-900">{c.value}</p>
          </article>
        ))}
      </section>

      <section className="glass-panel mt-10 p-6">
        <h3 className="font-display text-xl text-herbal-900">אימות תשלומים</h3>
        <p className="mt-2 text-sm text-slate-600">
          חיבור ספק סליקה (Stripe וכו׳) — עד אז מעקב ידני. ראו DEPLOY.md.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-right text-sm">
            <thead>
              <tr className="text-xs uppercase text-slate-500">
                <th className="pb-2">תאריך</th>
                <th className="pb-2">לקוח</th>
                <th className="pb-2">סכום</th>
                <th className="pb-2">סטטוס</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-herbal-100">
                <td className="py-3 text-slate-500" colSpan={4}>
                  אין חיבור סליקה — ראו DEPLOY.md להגדרת Stripe ו-Webhooks.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="glass-panel mt-10 p-6">
        <h3 className="font-display text-xl text-herbal-900">יומן ביקורת (Audit Log)</h3>
        <p className="mt-2 text-sm text-slate-600">שינויים ואירועים באתר.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-right text-sm">
            <thead>
              <tr className="text-xs uppercase text-slate-500">
                <th className="pb-2">זמן</th>
                <th className="pb-2">פעולה</th>
                <th className="pb-2">ישות</th>
                <th className="pb-2">מבצע</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-herbal-100">
              {audits.map((a) => (
                <tr key={a.id}>
                  <td className="whitespace-nowrap py-2 text-slate-600">
                    {a.createdAt.toLocaleString("he-IL")}
                  </td>
                  <td className="py-2 font-mono text-xs text-herbal-900">{a.action}</td>
                  <td className="py-2 text-slate-700">
                    {a.entityType}
                    {a.entityId ? ` · ${a.entityId.slice(0, 8)}…` : ""}
                  </td>
                  <td className="py-2 text-slate-600">{a.actor?.name ?? "מערכת"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
