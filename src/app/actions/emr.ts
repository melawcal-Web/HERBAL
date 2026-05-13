"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assertTherapist } from "@/lib/formula";
import type { FormulaJson } from "@/lib/formula";
import { writeAudit } from "@/lib/audit";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function createClinicalLog(input: {
  clientId: string;
  date: string;
  summary: string;
  formula: FormulaJson;
  notesImageDataUrl?: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id || !assertTherapist(session.user.role)) {
    throw new Error("אין הרשאה");
  }

  let notesImage: string | null = null;
  if (input.notesImageDataUrl?.startsWith("data:image")) {
    const match = /^data:(image\/\w+);base64,(.*)$/.exec(input.notesImageDataUrl);
    if (match) {
      const ext = match[1] === "image/png" ? "png" : "jpg";
      const buf = Buffer.from(match[2], "base64");
      const dir = path.join(process.cwd(), "public", "uploads", "notes");
      await mkdir(dir, { recursive: true });
      const filename = `${session.user.id}-${Date.now()}.${ext}`;
      const full = path.join(dir, filename);
      await writeFile(full, buf);
      notesImage = `/uploads/notes/${filename}`;
    }
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
