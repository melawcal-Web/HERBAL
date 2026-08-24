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

  return (
    <>
      <h1 className="font-display text-3xl text-herbal-900">ניהול תוכן</h1>
      <p className="mt-2 text-slate-600">
        עברו בין סוגי התוכן בסרגל, או לחצו על הפלוס כדי להוסיף פריט חדש.
      </p>
      <DashboardAddContent />
    </>
  );
}
