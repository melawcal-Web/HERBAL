import { prisma } from "@/lib/prisma";
import { TherapistApprovalsTabs } from "./TherapistApprovalsTabs";
import type { VerificationRowModel } from "./TherapistVerificationRow";

export const metadata = {
  title: "אישור תעודות מטפלים",
};

export default async function TherapistApprovalsPage() {
  const rows = await prisma.user.findMany({
    where: {
      role: "therapist",
      therapistProfile: { isNot: null },
      therapistVerification: { in: ["pending_approval", "approved", "rejected"] },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      certificateUrl: true,
      therapistVerification: true,
    },
  });

  const toModel = (r: (typeof rows)[number]): VerificationRowModel => ({
    id: r.id,
    name: r.name,
    email: r.email,
    certificateUrl: r.certificateUrl,
    therapistVerification: r.therapistVerification,
  });

  const pending = rows.filter((r) => r.therapistVerification === "pending_approval").map(toModel);
  const approved = rows.filter((r) => r.therapistVerification === "approved").map(toModel);
  const rejected = rows.filter((r) => r.therapistVerification === "rejected").map(toModel);

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-herbal-900 sm:text-2xl">אישור תעודות — מטפלים</h2>
      <p className="mt-2 text-sm text-slate-600">
        לשונית ממתינים: אישור או דחייה לפי תעודה. מאושרים: שלילת אישור (Revoke). ניתן לאשר מחדש מנדחים.
      </p>
      <TherapistApprovalsTabs pending={pending} approved={approved} rejected={rejected} />
    </div>
  );
}
