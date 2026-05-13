import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { assertTherapist } from "@/lib/formula";

export default async function EmrListPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  if (!assertTherapist(session.user.role)) redirect("/dashboard");

  const logs = await prisma.clinicalLog.findMany({
    where: { therapistId: session.user.id },
    orderBy: { date: "desc" },
    include: { client: { select: { name: true, email: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-herbal-900">יומן טיפולים</h1>
          <p className="mt-2 text-slate-600">רישום מפגשים, נוסחאות, ותמונות פתקים.</p>
        </div>
        <Link
          href="/dashboard/emr/new"
          className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-herbal-600 px-6 text-white hover:bg-herbal-500"
        >
          רישום טיפול חדש
        </Link>
      </div>
      <ul className="mt-8 space-y-3">
        {logs.map((log) => (
          <li key={log.id}>
            <Link
              href={`/dashboard/emr/${log.id}`}
              className="block rounded-2xl border border-herbal-100 bg-white p-4 shadow-sm hover:border-herbal-300"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-herbal-900">{log.client.name}</p>
                <p className="text-sm text-sage">{new Date(log.date).toLocaleDateString("he-IL")}</p>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{log.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
      {logs.length === 0 && (
        <p className="mt-6 text-slate-600">אין רישומים עדיין. צרו רישום ראשון.</p>
      )}
    </div>
  );
}
