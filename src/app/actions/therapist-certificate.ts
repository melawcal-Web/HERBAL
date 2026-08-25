"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assertTherapist } from "@/lib/formula";
import { isStoredImageUrl } from "@/lib/stored-image-url";
import { writeAudit } from "@/lib/audit";

/** העלאת תעודה — אחרי כן ניתן לערוך פרופיל; אישור אדמין נפרד לפרסום ציבורי/EMR */
export async function uploadTherapistCertificate(certificateUrl: string): Promise<{ ok: true }> {
  const session = await auth();
  if (!session?.user?.id || !assertTherapist(session.user.role)) {
    throw new Error("אין הרשאה");
  }
  if (session.user.role === "admin") {
    throw new Error("חשבון אדמין אינו מעלה תעודת מטפל כאן");
  }

  const url = certificateUrl.trim();
  if (!isStoredImageUrl(url)) {
    throw new Error("יש להעלות תמונת תעודה מהמחשב");
  }

  const current = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { therapistVerification: true, certificateUrl: true },
  });
  if (!current) throw new Error("משתמש לא נמצא");

  /** אחרי העלאה — ממתין לאישור; אם כבר מאושר, נשאר מאושר */
  const nextVerification =
    current.therapistVerification === "approved" ? "approved" : "pending_approval";

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      certificateUrl: url,
      therapistVerification: nextVerification,
    },
  });

  await writeAudit({
    actorId: session.user.id,
    action: "therapist.certificate.upload",
    entityType: "User",
    entityId: session.user.id,
    metadata: { certificateUrl: url, therapistVerification: nextVerification },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/admin/therapist-approvals");

  return { ok: true };
}
