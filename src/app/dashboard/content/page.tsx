import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { assertAdmin, assertTherapist } from "@/lib/formula";

export const metadata = { title: "ניהול תוכן הפרופיל" };

export default async function DashboardContentPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  if (!assertTherapist(session.user.role) && !assertAdmin(session.user.role)) {
    redirect("/herbal-index");
  }

  if (assertAdmin(session.user.role)) {
    redirect("/admin/content");
  }

  return (
    <>
      <h1 className="font-display text-3xl text-herbal-900">ניהול תוכן הפרופיל</h1>
      <p className="mt-2 text-slate-600">
        כאן מנהלים את מה שמופיע בדף הציבורי שלכם: ביוגרפיה, תמונה, התמחויות וקישורים. פרסום מאמרים ומוצרים
        חדשים מתבצע דרך צוות המרכז.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/dashboard/profile"
          className="rounded-full bg-herbal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-herbal-500"
        >
          עריכת פרופיל ויומן
        </Link>
        <Link
          href="/content-hub"
          className="rounded-full border border-herbal-300 px-5 py-2.5 text-sm font-semibold text-herbal-800 hover:bg-herbal-50"
        >
          צפייה בתוכן שפורסם
        </Link>
      </div>
    </>
  );
}
