import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assertAdmin, assertTherapist, therapistCanEditProfile } from "@/lib/formula";
import { memberLandingPath } from "@/lib/herbal-index-flag";
import { audienceLabels } from "@/lib/content-audience";
import { parseProductAudience, parseProductMetadata, productTypeLabel } from "@/lib/product-metadata";
import { publicProductHref } from "@/lib/product-href";
import { DigitalMaterialForm } from "@/components/dashboard/DigitalMaterialForm";
import { TherapistProductActiveToggle } from "./product-active-toggle";

export const metadata = { title: "חומרים דיגיטליים" };
export const dynamic = "force-dynamic";

function money(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(v);
}

export default async function DashboardProductsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  if (!assertTherapist(session.user.role) && !assertAdmin(session.user.role)) {
    redirect(memberLandingPath());
  }

  if (session.user.role === "therapist") {
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { certificateUrl: true },
    });
    if (!therapistCanEditProfile(session.user.role, me?.certificateUrl)) {
      redirect("/dashboard/profile");
    }
  }

  const products = await prisma.product.findMany({
    where: { therapistId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const profile = await prisma.therapistProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  return (
    <>
      <h1 className="font-display text-3xl text-herbal-900">חומרים דיגיטליים</h1>
      <p className="mt-2 text-slate-600">
        העלו PDF, וידאו, מתכון או חומר מדף. הפריט משויך אוטומטית לחשבון שלכם
        {profile ? (
          <>
            {" "}
            ומופיע ב
            <Link href={`/therapists/${profile.id}`} className="font-medium text-herbal-800 underline-offset-4 hover:underline">
              דף הציבורי
            </Link>
          </>
        ) : (
          " ובדף הציבורי לאחר שיוך לפרופיל"
        )}
        . אפשר גם להוסיף מתוך{" "}
        <Link href="/dashboard/content" className="font-medium text-herbal-800 underline-offset-4 hover:underline">
          ניהול תוכן
        </Link>
        .
      </p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-herbal-100 bg-white/90 shadow-sm">
        <table className="w-full min-w-[720px] text-right text-sm">
          <thead>
            <tr className="border-b border-herbal-100 bg-herbal-50/80 text-xs uppercase tracking-wide text-slate-600">
              <th className="px-4 py-3 font-semibold">כותרת</th>
              <th className="px-4 py-3 font-semibold">סוג</th>
              <th className="px-4 py-3 font-semibold">מחיר</th>
              <th className="px-4 py-3 font-semibold">קהל</th>
              <th className="px-4 py-3 font-semibold">סטטוס</th>
              <th className="px-4 py-3 font-semibold">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-herbal-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-herbal-50/40">
                <td className="px-4 py-3 font-medium text-herbal-900">
                  {p.title}
                  {parseProductMetadata(p.metadata).downloadUrl ? (
                    <span className="mr-2 block text-[11px] font-normal text-slate-400">יש קישור הורדה</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-slate-700">{productTypeLabel(p.type)}</td>
                <td className="px-4 py-3 text-slate-700">{money(p.price)}</td>
                <td className="px-4 py-3 text-xs text-slate-600">
                  {audienceLabels(parseProductAudience(p.audience)) || "—"}
                </td>
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
                      href={`/dashboard/products/${p.id}`}
                      className="rounded-lg border border-herbal-200 bg-white px-3 py-1.5 text-xs font-semibold text-herbal-900 hover:bg-herbal-50"
                    >
                      עריכה
                    </Link>
                    {p.active ? (
                      <Link
                        href={publicProductHref(p.id)}
                        className="rounded-lg border border-herbal-200 bg-white px-3 py-1.5 text-xs font-semibold text-herbal-900 hover:bg-herbal-50"
                      >
                        דף ציבורי
                      </Link>
                    ) : null}
                    <TherapistProductActiveToggle productId={p.id} active={p.active} title={p.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">עדיין אין חומרים דיגיטליים בחשבון זה.</p>
        ) : null}
      </div>

      <section className="mt-10 rounded-2xl border border-herbal-200/80 bg-white/90 p-5 shadow-sm sm:p-7">
        <h2 className="font-display text-lg font-bold text-herbal-900">העלאת חומר חדש</h2>
        <p className="mt-2 text-sm text-slate-600">
          הטופס משייך את הפריט אליך אוטומטית. בחרו סוג (כולל מוצר מדף, וידאו ומתכון), תיאור, מחירים וקישור הורדה.
        </p>
        <div className="mt-4">
          <DigitalMaterialForm mode="create" />
        </div>
      </section>
    </>
  );
}
