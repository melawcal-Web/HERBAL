import { prisma } from "@/lib/prisma";
import { TherapistVerificationRow, type VerificationRowModel } from "./TherapistVerificationRow";

export const metadata = {
  title: "אישור תעודות מטפלים",
};

export default async function TherapistApprovalsPage() {
  const rows = await prisma.user.findMany({
    where: {
      role: "therapist",
      therapistProfile: { isNot: null },
      therapistVerification: { in: ["pending_approval", "approved", "rejected"] },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      certificateUrl: true,
      therapistVerification: true,
    },
  });

  const pending = rows.filter((r) => r.therapistVerification === "pending_approval");
  const approved = rows.filter((r) => r.therapistVerification === "approved");
  const rejected = rows.filter((r) => r.therapistVerification === "rejected");

  const toModel = (r: (typeof rows)[number]): VerificationRowModel => ({
    id: r.id,
    name: r.name,
    email: r.email,
    certificateUrl: r.certificateUrl,
    therapistVerification: r.therapistVerification,
  });

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-herbal-900 sm:text-2xl">אישור תעודות — מטפלים</h2>
      <p className="mt-2 text-sm text-slate-600">
        בקשות ממתינות לאישור, ורשימת מטפלים מאושרים עם אפשרות לשלול אישור. דחייה או שלילה חוסמים גישה ל-EMR עד לאישור מחדש.
      </p>

      <section className="mt-10">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">ממתינים לאישור</h3>
        {pending.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">אין בקשות פתוחות.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-herbal-100 bg-white/90 shadow-sm">
            <table className="w-full min-w-[640px] text-right text-sm">
              <thead>
                <tr className="border-b border-herbal-100 bg-herbal-50/80 text-xs uppercase tracking-wide text-slate-600">
                  <th className="px-4 py-3 font-semibold">שם</th>
                  <th className="px-4 py-3 font-semibold">אימייל</th>
                  <th className="px-4 py-3 font-semibold">תעודה</th>
                  <th className="px-4 py-3 font-semibold">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-herbal-100">
                {pending.map((r) => (
                  <TherapistVerificationRow key={r.id} row={toModel(r)} mode="pending" />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-12">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">מטפלים מאושרים</h3>
        {approved.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">אין מטפלים מאושרים ברשימה.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-herbal-100 bg-white/90 shadow-sm">
            <table className="w-full min-w-[520px] text-right text-sm">
              <thead>
                <tr className="border-b border-herbal-100 bg-herbal-50/80 text-xs uppercase tracking-wide text-slate-600">
                  <th className="px-4 py-3 font-semibold">שם</th>
                  <th className="px-4 py-3 font-semibold">אימייל</th>
                  <th className="px-4 py-3 font-semibold">תעודה</th>
                  <th className="px-4 py-3 font-semibold">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-herbal-100">
                {approved.map((r) => (
                  <TherapistVerificationRow key={r.id} row={toModel(r)} mode="approved" />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-12">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">נדחו (ניתן לאשר מחדש)</h3>
        {rejected.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">אין חשבונות בסטטוס זה.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-herbal-100 bg-white/90 shadow-sm">
            <table className="w-full min-w-[640px] text-right text-sm">
              <thead>
                <tr className="border-b border-herbal-100 bg-herbal-50/80 text-xs uppercase tracking-wide text-slate-600">
                  <th className="px-4 py-3 font-semibold">שם</th>
                  <th className="px-4 py-3 font-semibold">אימייל</th>
                  <th className="px-4 py-3 font-semibold">תעודה</th>
                  <th className="px-4 py-3 font-semibold">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-herbal-100">
                {rejected.map((r) => (
                  <TherapistVerificationRow key={r.id} row={toModel(r)} mode="rejected" />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
