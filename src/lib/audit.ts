import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function writeAudit(params: {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId ?? undefined,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? undefined,
        metadata:
          params.metadata === undefined
            ? undefined
            : (params.metadata as Prisma.InputJsonValue),
      },
    });
  } catch {
    // avoid breaking primary flow if audit insert fails
  }
}
