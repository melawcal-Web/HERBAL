import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { assertTherapist } from "@/lib/formula";
import { getTherapistPendingApprovals } from "@/app/actions/commerce";
import Link from "next/link";
import { ApprovalsPanel } from "@/components/dashboard/ApprovalsPanel";

export const metadata = { title: "אישורים וצפיות" };

export default async function TherapistApprovalsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  if (!assertTherapist(session.user.role)) redirect("/herbal-index");

  const pending = await getTherapistPendingApprovals();

  return (
    <>
      <h1 className="font-display text-3xl text-herbal-900">אישורים וצפיות</h1>
      <p className="mt-2 text-sm text-slate-600">
        לאחר אימות תשלום בביט/העברה — לחצו «אשר גישה». עמלת מרכז 15% נרשמת רק עבור מחיר מלא.
      </p>
      <nav className="mt-6 flex flex-wrap gap-2">
        <span className="rounded-full bg-herbal-600 px-4 py-2 text-xs font-semibold text-white">אישורים</span>
        <Link
          href="/dashboard/reports"
          className="rounded-full border border-herbal-200 px-4 py-2 text-xs font-semibold text-herbal-800 hover:bg-herbal-50"
        >
          דוח צפיות
        </Link>
        <Link
          href="/dashboard/finance"
          className="rounded-full border border-herbal-200 px-4 py-2 text-xs font-semibold text-herbal-800 hover:bg-herbal-50"
        >
          כספים
        </Link>
      </nav>
      <div className="mt-8">
        <ApprovalsPanel initial={pending} />
      </div>
    </>
  );
}
