"use server";

import type { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { assertAdmin } from "@/lib/formula";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || !assertAdmin(session.user.role)) {
    throw new Error("אין הרשאה");
  }
  return session;
}

export async function setUserAdminRole(targetUserId: string, makeAdmin: boolean) {
  const session = await requireAdmin();
  if (targetUserId === session.user.id && !makeAdmin) {
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    if (adminCount <= 1) {
      throw new Error("לא ניתן להסיר את מנהל/ת המערכת האחרון/ה");
    }
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: { therapistProfile: { select: { id: true } } },
  });
  if (!target) throw new Error("משתמש/ת לא נמצא/ה");

  let nextRole: UserRole;
  if (makeAdmin) {
    nextRole = "admin";
  } else if (target.therapistProfile) {
    nextRole = "therapist";
  } else {
    nextRole = "client";
  }

  if (!makeAdmin && target.role === "admin") {
    const otherAdmins = await prisma.user.count({
      where: { role: "admin", NOT: { id: targetUserId } },
    });
    if (otherAdmins === 0) {
      throw new Error("חייבת להישאר הרשאת מנהל אחת לפחות במערכת");
    }
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: nextRole },
  });

  await writeAudit({
    actorId: session.user.id,
    action: makeAdmin ? "admin.user.promote" : "admin.user.demote",
    entityType: "User",
    entityId: targetUserId,
    metadata: { nextRole, email: target.email },
  });

  revalidatePath("/admin/users");
  revalidatePath("/dashboard");
}
