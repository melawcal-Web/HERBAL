import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ExportClinicalSummary } from "@/components/ExportClinicalSummary";
import { therapistCanUseClinicalTools, type FormulaJson } from "@/lib/formula";
type Props = { params: Promise<{ id: string }> };

export default async function ClinicalLogDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const log = await prisma.clinicalLog.findUnique({
    where: { id },
    include: {
      therapist: { select: { id: true, name: true } },
      client: { select: { id: true, name: true } },
    },
  });
  if (!log) notFound();

  const isTherapist = log.therapistId === session.user.id;
  const isClient = log.clientId === session.user.id;
  const isAdmin = session.user.role === "admin";
  if (!isTherapist && !isClient && !isAdmin) notFound();

  if (
    isTherapist &&
    !therapistCanUseClinicalTools(session.user.role, session.user.therapistVerification)
  ) {
    redirect("/herbal-index");
  }

  const formula = log.formulaJson as unknown as FormulaJson;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-herbal-900">רישום טיפול</h1>
        <Link href={isTherapist ? "/dashboard/emr" : "/herbal-index"} className="text-sm text-herbal-700 underline">
          חזרה
        </Link>
      </div>
      <dl className="mt-6 space-y-3 rounded-2xl border border-herbal-100 bg-white p-5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">תאריך</dt>
          <dd>{new Date(log.date).toLocaleDateString("he-IL")}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">מטפל/ת</dt>
          <dd className="font-medium">{log.therapist.name}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">לקוח/ה</dt>
          <dd className="font-medium">{log.client.name}</dd>
        </div>
      </dl>
      <section className="mt-6 rounded-2xl border border-herbal-100 bg-white p-5">
        <h2 className="font-semibold text-herbal-900">סיכום</h2>
        <p className="mt-2 whitespace-pre-wrap text-slate-700">{log.summary}</p>
      </section>
      {log.notesImage && (
        <section className="mt-6">
          <h2 className="font-semibold text-herbal-900">פתק בכתב יד</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={log.notesImage} alt="" className="mt-3 max-w-full rounded-xl border border-herbal-100" />
        </section>
      )}
      {(isTherapist || isAdmin) && (
        <section className="mt-8 rounded-2xl border border-herbal-100 bg-herbal-50/60 p-5">
          <h2 className="font-semibold text-herbal-900">ייצוא</h2>
          <p className="mt-1 text-sm text-slate-600">PDF מיידי, או העתקה ל-Google Docs.</p>
          <div className="mt-4">
            <ExportClinicalSummary
              therapistName={log.therapist.name}
              clientName={log.client.name}
              dateIso={log.date.toISOString()}
              summary={log.summary}
              formula={formula}
            />
          </div>
        </section>
      )}
    </div>
  );
}
