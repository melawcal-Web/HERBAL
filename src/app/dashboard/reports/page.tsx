import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { assertTherapist } from "@/lib/formula";
import { getTherapistViewReport } from "@/app/actions/commerce";
import Link from "next/link";
import { ViewReportTable } from "@/components/dashboard/ViewReportTable";

export const metadata = { title: "דוח צפיות ושימושים" };

export default async function TherapistReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  if (!assertTherapist(session.user.role)) redirect("/herbal-index");

  const rows = await getTherapistViewReport();

  return (
    <>
      <h1 className="font-display text-3xl text-herbal-900">דוח צפיות ושימושים</h1>
      <p className="mt-2 text-sm text-slate-600">
        כל רכישה, הרשמה (חינם/חבר/מלא) וצפייה בתוכן — וידאו, פודקאסט, מאמרים, מתכונים והרצאות.
      </p>
      <nav className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/dashboard/approvals"
          className="rounded-full border border-herbal-200 px-4 py-2 text-xs font-semibold text-herbal-800 hover:bg-herbal-50"
        >
          אישורים
        </Link>
        <span className="rounded-full bg-herbal-600 px-4 py-2 text-xs font-semibold text-white">דוח צפיות</span>
        <Link
          href="/dashboard/finance"
          className="rounded-full border border-herbal-200 px-4 py-2 text-xs font-semibold text-herbal-800 hover:bg-herbal-50"
        >
          כספים
        </Link>
      </nav>
      <div className="mt-8">
        <ViewReportTable rows={rows} />
      </div>
    </>
  );
}
