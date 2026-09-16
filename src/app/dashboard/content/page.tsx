import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assertAdmin, assertTherapist, therapistCanEditProfile } from "@/lib/formula";
import { DashboardAddContent } from "@/components/dashboard/DashboardAddContent";

export const metadata = { title: "ניהול תוכן" };

export default async function DashboardContentPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  if (!assertTherapist(session.user.role) && !assertAdmin(session.user.role)) {
    redirect("/herbal-index");
  }

  if (session.user.role === "therapist") {
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { certificateUrl: true },
    });
    if (!therapistCanEditProfile(session.user.role, me?.certificateUrl)) {
      redirect("/dashboard/profile");
    }
  }

  return (
    <>
      <h1 className="font-display text-3xl text-herbal-900">ניהול תוכן</h1>
      <p className="mt-2 text-slate-600">
        עברו בין סוגי התוכן בסרגל, או לחצו על הפלוס כדי להוסיף פריט חדש. חומרים דיגיטליים (PDF, וידאו, מתכון) משויכים אוטומטית אליכם ומופיעים בדף הציבורי — ראו גם{" "}
        <Link href="/dashboard/products" className="font-medium text-herbal-800 underline-offset-4 hover:underline">
          החומרים שלי
        </Link>
        .
      </p>
      <DashboardAddContent />
    </>
  );
}
