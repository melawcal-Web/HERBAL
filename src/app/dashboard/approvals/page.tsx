import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { assertTherapist } from "@/lib/formula";
import { memberLandingPath } from "@/lib/herbal-index-flag";
import { getTherapistPendingApprovals } from "@/app/actions/commerce";
import { getTherapistPendingDigitalIntents } from "@/app/actions/digital-purchase";
import Link from "next/link";
import { ApprovalsPanel } from "@/components/dashboard/ApprovalsPanel";
import { PurchaseIntentsPanel } from "@/components/dashboard/PurchaseIntentsPanel";

export const metadata = { title: "אישורים וצפיות" };

export default async function TherapistApprovalsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  if (!assertTherapist(session.user.role)) redirect(memberLandingPath());

  const [pending, intents] = await Promise.all([
    getTherapistPendingApprovals(),
    getTherapistPendingDigitalIntents(),
  ]);

  return (
    <>
      <h1 className="font-display text-3xl text-herbal-900">אישורים וצפיות</h1>
      <p className="mt-2 text-sm text-slate-600">
        כוונות רכישה דיגיטליות וגם בקשות גישה ידניות. «התשלום לא התקבל» נספר כהתראה; שלוש התראות חוסמות רכישות
        נוספות.
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
      <div className="mt-8 space-y-10">
        <section>
          <h2 className="font-display text-xl font-bold text-herbal-900">כוונות רכישה דיגיטליות</h2>
          <div className="mt-4">
            <PurchaseIntentsPanel initial={intents} />
          </div>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-herbal-900">בקשות גישה ידניות</h2>
          <div className="mt-4">
            <ApprovalsPanel initial={pending} />
          </div>
        </section>
      </div>
    </>
  );
}
