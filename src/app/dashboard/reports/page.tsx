import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { assertTherapist } from "@/lib/formula";
import { getTherapistViewReport } from "@/app/actions/commerce";
import { ViewReportTable } from "@/components/dashboard/ViewReportTable";

export const metadata = { title: "דוח צפיות ושימושים" };

export default async function TherapistReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  if (!assertTherapist(session.user.role)) redirect("/dashboard");

  const rows = await getTherapistViewReport();

  return (
    <>
      <h1 className="font-display text-3xl text-herbal-900">דוח צפיות ושימושים</h1>
      <p className="mt-2 text-sm text-slate-600">
        כל רכישה, הרשמה (חינם/חבר/מלא) וצפייה בתוכן — וידאו, פודקאסט, מאמרים, מתכונים והרצאות.
      </p>
      <div className="mt-8">
        <ViewReportTable rows={rows} />
      </div>
    </>
  );
}
