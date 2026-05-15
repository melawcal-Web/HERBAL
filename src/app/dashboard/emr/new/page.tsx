import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { assertTherapist, therapistCanUseClinicalTools } from "@/lib/formula";
import { NewClinicalLogForm } from "./new-log-form";

export default async function NewClinicalLogPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  if (!assertTherapist(session.user.role)) redirect("/herbal-index");
  if (!therapistCanUseClinicalTools(session.user.role, session.user.therapistVerification)) redirect("/dashboard/profile");

  const clients = await prisma.user.findMany({
    where: { role: "client" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-herbal-900">רישום טיפול חדש</h1>
      <p className="mt-2 text-slate-600">בחרו לקוח, תאריך, סיכום, נוסחה, ואופציונלית צילום פתק בכתב יד.</p>
      <div className="mt-8">
        <NewClinicalLogForm clients={clients} />
      </div>
    </div>
  );
}
