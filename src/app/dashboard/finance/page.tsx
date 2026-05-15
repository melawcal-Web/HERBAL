import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { assertTherapist } from "@/lib/formula";
import { getTherapistFinanceLedger } from "@/app/actions/commerce";
import { FinanceLedger } from "@/components/dashboard/FinanceLedger";

export const metadata = { title: "כספים" };

export default async function TherapistFinancePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  if (!assertTherapist(session.user.role)) redirect("/dashboard");

  const { rows, totalCommissionOwed } = await getTherapistFinanceLedger();

  return (
    <>
      <h1 className="font-display text-3xl text-herbal-900">כספים</h1>
      <p className="mt-2 text-sm text-slate-600">
        פנקס תנועות — כולל משתמשים ב-₪0 (חינם/חבר). עמלה למרכז: 15% ממחיר מלא בלבד.
      </p>
      <div className="mt-8">
        <FinanceLedger rows={rows} totalCommissionOwed={totalCommissionOwed} />
      </div>
    </>
  );
}
