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

  revalidatePath("/admin/therapist-approvals");
  revalidatePath("/admin/users");
  revalidatePath("/dashboard");
}

export async function approveTherapistCertificate(targetUserId: string) {
  const session = await requireAdmin();
  const u = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, email: true, role: true, therapistVerification: true, therapistProfile: { select: { id: true } } },
  });
  if (!u?.therapistProfile || u.role !== "therapist") {
    throw new Error("רק חשבון מטפל/ת עם פרופיל ניתן לאישור");
  }
  if (u.therapistVerification !== "pending_approval" && u.therapistVerification !== "rejected") {
    throw new Error("החשבון לא במצב המתנה לאישור");
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { therapistVerification: "approved" },
  });

  await writeAudit({
    actorId: session.user.id,
    action: "admin.therapist.approve",
    entityType: "User",
    entityId: targetUserId,
    metadata: { email: u.email },
  });

  revalidatePath("/admin/therapist-approvals");
  revalidatePath("/admin/users");
  revalidatePath("/therapists");
  revalidatePath("/");
  revalidatePath(`/therapists/${u.therapistProfile.id}`);
}

export async function rejectTherapistCertificate(targetUserId: string) {
  const session = await requireAdmin();
  const u = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      email: true,
      role: true,
      therapistVerification: true,
      therapistProfile: { select: { id: true } },
    },
  });
  if (!u || u.role !== "therapist") throw new Error("משתמש/ת לא נמצא/ה");
  if (u.therapistVerification !== "pending_approval") {
    throw new Error("ניתן לדחות רק בקשות הממתינות לאישור");
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { therapistVerification: "rejected" },
  });

  await writeAudit({
    actorId: session.user.id,
    action: "admin.therapist.reject",
    entityType: "User",
    entityId: targetUserId,
    metadata: { email: u.email },
  });

  revalidatePath("/admin/therapist-approvals");
  revalidatePath("/admin/users");
  revalidatePath("/therapists");
  revalidatePath("/");
  if (u.therapistProfile?.id) revalidatePath(`/therapists/${u.therapistProfile.id}`);
}

export async function revokeTherapistApproval(targetUserId: string) {
  const session = await requireAdmin();
  const u = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, email: true, role: true, therapistVerification: true, therapistProfile: { select: { id: true } } },
  });
  if (!u?.therapistProfile || u.role !== "therapist") {
    throw new Error("רק מטפל/ת רשום/ה");
  }
  if (u.therapistVerification !== "approved") {
    throw new Error("ניתן לשלול רק מטפל/ת מאושר/ת");
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { therapistVerification: "rejected" },
  });

  await writeAudit({
    actorId: session.user.id,
    action: "admin.therapist.revoke",
    entityType: "User",
    entityId: targetUserId,
    metadata: { email: u.email },
  });

  revalidatePath("/admin/therapist-approvals");
  revalidatePath("/therapists");
  revalidatePath("/");
  revalidatePath(`/therapists/${u.therapistProfile.id}`);
}
