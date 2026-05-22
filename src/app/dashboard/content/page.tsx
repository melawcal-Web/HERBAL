import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { assertAdmin, assertTherapist } from "@/lib/formula";
import { DashboardAddContent } from "@/components/dashboard/DashboardAddContent";

export const metadata = { title: "ניהול תוכן" };

export default async function DashboardContentPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  if (!assertTherapist(session.user.role) && !assertAdmin(session.user.role)) {
    redirect("/herbal-index");
  }

  if (assertAdmin(session.user.role)) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-herbal-900">ניהול תוכן</h1>
      <p className="mt-2 text-slate-600">
        הוסיפו תוכן שיוצג בפרופיל הציבורי שלכם ובאתר: מאמר, הרצאה, מאמר צמח לאינדקס, מפגש זום או סדנה.
      </p>
      <DashboardAddContent />
    </div>
  );
}
