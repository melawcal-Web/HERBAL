import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-herbal-900">מרכז ניהול — תמונת על</h1>
          <p className="mt-2 text-slate-600">פעילות, ביקורת, ותשלומים (חיבור ספק יבוצע ב-DEPLOY).</p>
        </div>
        <Link href="/dashboard" className="text-sm text-herbal-700 underline">
          חזרה ללוח הבקרה
        </Link>
      </div>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "משתמשים", value: users },
          { label: "מטפלים (פרופילים)", value: therapists },
          { label: "רישומי EMR", value: logs },
          { label: "מוצרים בשוק", value: products },
        ].map((c) => (
          <article
            key={c.label}
            className="rounded-2xl border border-herbal-100 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold text-herbal-900">{c.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-12 rounded-2xl border border-herbal-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl text-herbal-900">אימות תשלומים</h2>
        <p className="mt-2 text-sm text-slate-600">
          חברו כאן ספק סליקה (Stripe / PayPal / משלים מקומי). עד אז, עקבו אחרי העברות בנק ידנית וסמנו
          בטבלה פנימית.
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

      <section className="mt-10 rounded-2xl border border-herbal-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl text-herbal-900">יומן ביקורת (Audit Log)</h2>
        <p className="mt-2 text-sm text-slate-600">מעקב אחרי שינויים ואירועים קריטיים באתר.</p>
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
                  <td className="py-2 whitespace-nowrap text-slate-600">
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
