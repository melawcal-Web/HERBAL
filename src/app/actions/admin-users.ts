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

/** שכפול מבנה פרופיל מטפל — אדמין בלבד, עם אימייל דמה ייחודי */
export async function duplicateTherapistProfile(sourceUserId: string): Promise<{ email: string; profileId: string }> {
  const session = await requireAdmin();

  const source = await prisma.user.findUnique({
    where: { id: sourceUserId },
    include: { therapistProfile: true },
  });
  if (!source?.therapistProfile) throw new Error("לא נמצא פרופיל מטפל לשכפול");

  const p = source.therapistProfile;
  const stamp = Date.now().toString(36);
  const email = `duplicate+${stamp}@herbal.local`;
  const slug = `${p.slug}-copy-${stamp.slice(-5)}`;

  const created = await prisma.user.create({
    data: {
      name: `${source.name} (עותק)`,
      email,
      role: "therapist",
      therapistVerification: "none",
      registrationPersona: source.registrationPersona,
      image: source.image,
      therapistProfile: {
        create: {
          slug,
          publicTherapistTitle: p.publicTherapistTitle,
          bio: p.bio,
          clinicalExperience: p.clinicalExperience,
          specialty1: p.specialty1,
          specialty2: p.specialty2,
          specialty3: p.specialty3,
          acceptsSupervisionRequests: p.acceptsSupervisionRequests,
          supervisionHourlyRate: p.supervisionHourlyRate,
          contactInfo: p.contactInfo as object,
          socialLinks: p.socialLinks as object,
          weeklyAvailability: p.weeklyAvailability ?? undefined,
          availabilityOpenUntil: p.availabilityOpenUntil,
          showPublicCalendar: p.showPublicCalendar,
          portfolioTimeline: p.portfolioTimeline ?? undefined,
        },
      },
    },
    include: { therapistProfile: { select: { id: true } } },
  });

  await writeAudit({
    actorId: session.user.id,
    action: "admin.therapist.duplicate",
    entityType: "User",
    entityId: created.id,
    metadata: { sourceUserId, email, slug },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/therapist-approvals");
  revalidatePath("/therapists");

  return { email, profileId: created.therapistProfile!.id };
}

export async function updateAdminUser(input: {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
}) {
  const session = await requireAdmin();
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!name.length) throw new Error("שם חובה");
  if (!email.length) throw new Error("אימייל חובה");

  const target = await prisma.user.findUnique({
    where: { id: input.userId },
    include: { therapistProfile: { select: { id: true } } },
  });
  if (!target) throw new Error("משתמש/ת לא נמצא/ה");

  const taken = await prisma.user.findFirst({
    where: { email, NOT: { id: input.userId } },
  });
  if (taken) throw new Error("אימייל כבר בשימוש");

  if (input.userId === session.user.id && input.role !== "admin") {
    const otherAdmins = await prisma.user.count({
      where: { role: "admin", NOT: { id: session.user.id } },
    });
    if (otherAdmins === 0) throw new Error("לא ניתן להסיר הרשאת מנהל מעצמך כשאתם המנהלים היחידים");
  }

  if (input.role === "therapist" && !target.therapistProfile) {
    throw new Error("לא ניתן להגדיר כמטפל/ת בלי פרופיל מטפל — צרו פרופיל תחילה");
  }

  await prisma.user.update({
    where: { id: input.userId },
    data: { name, email, role: input.role },
  });

  await writeAudit({
    actorId: session.user.id,
    action: "admin.user.update",
    entityType: "User",
    entityId: input.userId,
    metadata: { email, role: input.role },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/therapist-approvals");
  revalidatePath("/dashboard");
  revalidatePath("/therapists");
  revalidatePath("/");
}

export async function deleteAdminUser(targetUserId: string) {
  const session = await requireAdmin();
  if (targetUserId === session.user.id) {
    throw new Error("לא ניתן למחוק את החשבון שאתם מחוברים אליו");
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, role: true, email: true, therapistProfile: { select: { id: true } } },
  });
  if (!target) throw new Error("משתמש/ת לא נמצא/ה");

  if (target.role === "admin") {
    const admins = await prisma.user.count({ where: { role: "admin" } });
    if (admins <= 1) throw new Error("לא ניתן למחוק את מנהל/ת המערכת האחרון/ה");
  }

  await prisma.user.delete({ where: { id: targetUserId } });

  await writeAudit({
    actorId: session.user.id,
    action: "admin.user.delete",
    entityType: "User",
    entityId: targetUserId,
    metadata: { email: target.email },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/therapist-approvals");
  revalidatePath("/therapists");
  revalidatePath("/");
  if (target.therapistProfile?.id) revalidatePath(`/therapists/${target.therapistProfile.id}`);
}
