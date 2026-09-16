import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { assertTherapist } from "@/lib/formula";
import { getTherapistFinanceLedger } from "@/app/actions/commerce";
import { getTherapistPaymentSettings } from "@/app/actions/therapist-payments";
import Link from "next/link";
import { FinanceLedger } from "@/components/dashboard/FinanceLedger";
import { TherapistPaymentSettingsForm } from "@/components/dashboard/TherapistPaymentSettingsForm";

export const metadata = { title: "כספים" };

export default async function TherapistFinancePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  if (!assertTherapist(session.user.role)) redirect("/herbal-index");

  const [{ rows, totalCommissionOwed }, paymentSettings] = await Promise.all([
    getTherapistFinanceLedger(),
    getTherapistPaymentSettings(),
  ]);

  return (
    <>
      <h1 className="font-display text-3xl text-herbal-900">כספים</h1>
      <p className="mt-2 text-sm text-slate-600">
        פנקס תנועות — כולל משתמשים ב-₪0 (חינם/חבר). עמלה למרכז: 15% ממחיר מלא בלבד.
      </p>

      <section className="mt-8 rounded-2xl border border-herbal-200/80 bg-white/90 p-5 shadow-sm sm:p-7">
        <h2 className="font-display text-xl font-bold text-herbal-900">תשלום מלקוחות — Bit ו-PayBox</h2>
        <div className="mt-4">
          <TherapistPaymentSettingsForm initial={paymentSettings} />
        </div>
      </section>
      <nav className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/dashboard/approvals"
          className="rounded-full border border-herbal-200 px-4 py-2 text-xs font-semibold text-herbal-800 hover:bg-herbal-50"
        >
          אישורים
        </Link>
        <Link
          href="/dashboard/reports"
          className="rounded-full border border-herbal-200 px-4 py-2 text-xs font-semibold text-herbal-800 hover:bg-herbal-50"
        >
          דוח צפיות
        </Link>
        <span className="rounded-full bg-herbal-600 px-4 py-2 text-xs font-semibold text-white">כספים</span>
      </nav>
      <div className="mt-8">
        <FinanceLedger rows={rows} totalCommissionOwed={totalCommissionOwed} />
      </div>
    </>
  );
}
