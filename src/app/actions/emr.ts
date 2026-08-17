"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { therapistCanUseClinicalTools } from "@/lib/formula";
import type { FormulaJson } from "@/lib/formula";
import { writeAudit } from "@/lib/audit";
import { saveUploadedImageDataUrl } from "@/lib/save-uploaded-image";

export async function createClinicalLog(input: {
  clientId: string;
  date: string;
  summary: string;
  formula: FormulaJson;
  notesImageDataUrl?: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id || !therapistCanUseClinicalTools(session.user.role, session.user.therapistVerification)) {
    throw new Error("אין הרשאה");
  }

  let notesImage: string | null = null;
  if (input.notesImageDataUrl?.startsWith("data:image")) {
    notesImage = await saveUploadedImageDataUrl(input.notesImageDataUrl, "notes");
  }

  const log = await prisma.clinicalLog.create({
    data: {
      therapistId: session.user.id,
      clientId: input.clientId,
      date: new Date(input.date),
      summary: input.summary,
      formulaJson: input.formula as object,
      notesImage,
    },
  });

  await writeAudit({
    actorId: session.user.id,
    action: "clinical_log.create",
    entityType: "ClinicalLog",
    entityId: log.id,
    metadata: { clientId: input.clientId },
  });

  revalidatePath("/dashboard/emr");
  return log.id;
}
