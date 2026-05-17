import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/formula";
import { postLoginPath } from "@/lib/post-login-path";
import type { Prisma, ReferralChannel } from "@prisma/client";

export const metadata = { title: "דוח פניות" };

const CHANNEL_LABEL: Record<ReferralChannel, string> = {
  phone: "טלפון",
  email: "מייל",
  whatsapp: "וואטסאפ",
};

type Search = { from: string; to: string; therapist: string };

function parseSearch(sp: Record<string, string | string[] | undefined> | undefined): Search {
  const g = (k: string) => {
    const v = sp?.[k];
    return typeof v === "string" ? v : "";
  };
  return { from: g("from"), to: g("to"), therapist: g("therapist") };
}

export default async function AdminReferralsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin?callbackUrl=/admin/referrals");
  if (!assertAdmin(session.user.role)) redirect(postLoginPath(session));

  const sp = parseSearch(await searchParams);
  const therapistName = sp.therapist.trim();

  let fromDate: Date | undefined;
  let toDate: Date | undefined;
  if (sp.from.trim()) {
    const d = new Date(sp.from);
    if (!Number.isNaN(d.getTime())) fromDate = d;
  }
  if (sp.to.trim()) {
    const d = new Date(sp.to);
    if (!Number.isNaN(d.getTime())) toDate = d;
  }

  const where: Prisma.TherapistReferralWhereInput = {};
  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt.gte = fromDate;
    if (toDate) where.createdAt.lte = toDate;
  }
  if (therapistName) {
    where.therapistNameSnapshot = { contains: therapistName };
  }

  const rows = await prisma.therapistReferral.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const fmt = new Intl.DateTimeFormat("he-IL", {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-herbal-900 sm:text-2xl">דוח פניות לקוחות מול מטפלים</h2>
      <p className="mt-2 text-sm text-slate-600">
        נרשמות פניות של משתמשים מחוברים (לא אדמין) בלחיצה על טלפון, מייל או וואטסאפ בדף הציבורי של מטפל/ת.
      </p>

      <form
        method="get"
        className="mt-6 flex flex-col gap-4 rounded-2xl border border-herbal-100 bg-white/90 p-4 shadow-sm lg:flex-row lg:flex-wrap lg:items-end"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-600">מתאריך ושעה</label>
          <input
            name="from"
            type="datetime-local"
            defaultValue={sp.from}
            className="min-h-[44px] rounded-xl border border-herbal-200 px-3 py-2"
            dir="ltr"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-600">עד תאריך ושעה</label>
          <input
            name="to"
            type="datetime-local"
            defaultValue={sp.to}
            className="min-h-[44px] rounded-xl border border-herbal-200 px-3 py-2"
            dir="ltr"
          />
        </div>
        <div className="flex min-w-[min(100%,14rem)] flex-1 flex-col gap-1">
          <label className="text-xs font-semibold text-slate-600">שם מטפל (חיפוש טקסט)</label>
          <input
            name="therapist"
            defaultValue={therapistName}
            className="min-h-[44px] rounded-xl border border-herbal-200 px-3 py-2"
            placeholder="לדוגמה: רונית"
          />
        </div>
        <button
          type="submit"
          className="min-h-[44px] rounded-full bg-herbal-600 px-6 text-sm font-semibold text-white transition hover:bg-herbal-500"
        >
          החלת סינון
        </button>
        <Link href="/admin/referrals" className="min-h-[44px] self-center text-sm font-medium text-herbal-700 underline-offset-4 hover:underline lg:self-end">
          איפוס
        </Link>
      </form>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-herbal-100 bg-white/90 shadow-sm">
        <table className="w-full min-w-[960px] text-right text-sm">
          <thead>
            <tr className="border-b border-herbal-100 bg-herbal-50/80 text-xs uppercase tracking-wide text-slate-600">
              <th className="px-3 py-3 font-semibold">מועד</th>
              <th className="px-3 py-3 font-semibold">ערוץ</th>
              <th className="px-3 py-3 font-semibold">מטפל/ת</th>
              <th className="px-3 py-3 font-semibold">לקוח/ה</th>
              <th className="px-3 py-3 font-semibold">אימייל לקוח</th>
              <th className="px-3 py-3 font-semibold">טלפון לקוח</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-herbal-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-600">
                  אין רשומות התואמות לסינון.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-herbal-50/40">
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-slate-800" dir="ltr">
                    {fmt.format(r.createdAt)}
                  </td>
                  <td className="px-3 py-3 font-medium text-herbal-900">{CHANNEL_LABEL[r.channel]}</td>
                  <td className="px-3 py-3">
                    <span className="font-medium text-herbal-900">{r.therapistNameSnapshot}</span>
                    <br />
                    <Link href={r.therapistPublicPath} className="text-xs font-semibold text-herbal-700 underline-offset-2 hover:underline" dir="ltr">
                      {r.therapistPublicPath}
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <span className="font-medium text-herbal-900">{r.clientNameSnapshot}</span>
                    <br />
                    <Link href={r.clientAdminPath} className="text-xs font-semibold text-herbal-700 underline-offset-2 hover:underline" dir="ltr">
                      פירטי לקוח במערכת
                    </Link>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-700" dir="ltr">
                    {r.clientEmailSnapshot}
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-700" dir="ltr">
                    {r.clientPhoneSnapshot ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
