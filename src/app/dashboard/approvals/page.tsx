import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { assertTherapist } from "@/lib/formula";
import { getTherapistPendingApprovals } from "@/app/actions/commerce";
import { ApprovalsPanel } from "@/components/dashboard/ApprovalsPanel";

export const metadata = { title: "אישורי תשלום" };

export default async function TherapistApprovalsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  if (!assertTherapist(session.user.role)) redirect("/dashboard");

  const pending = await getTherapistPendingApprovals();

  return (
    <>
      <h1 className="font-display text-3xl text-herbal-900">אישורי גישה</h1>
      <p className="mt-2 text-sm text-slate-600">
        לאחר אימות תשלום בביט/העברה — לחצו «אשר גישה». עמלת מרכז 15% נרשמת רק עבור מחיר מלא.
      </p>
      <div className="mt-8">
        <ApprovalsPanel initial={pending} />
      </div>
    </>
  );
}
