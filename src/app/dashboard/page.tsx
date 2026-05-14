import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardAddContent } from "@/components/dashboard/DashboardAddContent";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const role = session.user.role;
  const isTherapist = role === "therapist" || role === "admin";
  const isAdmin = role === "admin";

  const clientLogs =
    role === "client"
      ? await prisma.clinicalLog.findMany({
          where: { clientId: session.user.id },
          orderBy: { date: "desc" },
          take: 10,
          include: { therapist: { select: { name: true } } },
        })
      : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-herbal-900">לוח בקרה אישי</h1>
      <p className="mt-2 text-slate-600">שלום {session.user.name}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {isTherapist && (
          <>
            <Link
              href="/dashboard/emr"
              className="rounded-2xl border border-herbal-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-herbal-900">יומן קליני (EMR)</h2>
              <p className="mt-2 text-sm text-slate-600">רישום טיפולים, נוסחאות, והעלאת פתקים.</p>
            </Link>
            <Link
              href="/dashboard/profile"
              className="rounded-2xl border border-herbal-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-herbal-900">פרופיל מטפל/ת</h2>
              <p className="mt-2 text-sm text-slate-600">ביו, מומחיות, קישורים וכתובת דף ציבורית.</p>
            </Link>
          </>
        )}
        {isAdmin && (
          <Link
            href="/admin"
            className="rounded-2xl border border-herbal-200 bg-herbal-50 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:col-span-2"
          >
            <h2 className="text-lg font-semibold text-herbal-900">מרכז ניהול</h2>
            <p className="mt-2 text-sm text-slate-600">תמונת על, ביקורת, משתמשים ורשימת קורסים וסדנאות.</p>
          </Link>
        )}
      </div>

      {isAdmin && <DashboardAddContent />}

      {role === "client" && (
        <section className="mt-10">
          <h2 className="font-display text-xl text-herbal-900">סיכומי טיפול ששותפו איתך</h2>
          {clientLogs.length === 0 ? (
            <p className="mt-3 text-slate-600">עדיין אין רישומים. לאחר טיפול המטפל/ת יוסיף/תכניס סיכום.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {clientLogs.map((log) => (
                <li key={log.id}>
                  <Link
                    href={`/dashboard/emr/${log.id}`}
                    className="block rounded-xl border border-herbal-100 bg-white p-4 hover:border-herbal-300"
                  >
                    <p className="text-sm text-sage">{new Date(log.date).toLocaleDateString("he-IL")}</p>
                    <p className="font-medium text-herbal-900">{log.therapist.name}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{log.summary}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
