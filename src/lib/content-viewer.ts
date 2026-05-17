import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { ContentViewer } from "@/lib/content-audience";

export async function getContentViewer(): Promise<ContentViewer | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const row = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, registrationPersona: true },
  });
  if (!row) return null;

  return {
    userId: session.user.id,
    role: row.role,
    registrationPersona: row.registrationPersona,
  };
}
