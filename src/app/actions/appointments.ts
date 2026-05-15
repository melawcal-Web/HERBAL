"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseWeeklyAvailability, type WeeklyAvailability } from "@/lib/therapist-availability";

export async function saveTherapistWeeklyAvailability(availability: WeeklyAvailability): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("יש להתחבר");

  const profile = await prisma.therapistProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) throw new Error("פרופיל מטפל לא נמצא");

  await prisma.therapistProfile.update({
    where: { id: profile.id },
    data: { weeklyAvailability: availability },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath(`/therapists/${profile.id}`);
}

export async function requestAppointment(input: {
  therapistUserId: string;
  therapistProfileId: string;
  slotStart: string;
  slotEnd: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  note?: string;
}): Promise<void> {
  const schema = z.object({
    therapistUserId: z.string().min(1),
    therapistProfileId: z.string().min(1),
    slotStart: z.string().min(1),
    slotEnd: z.string().min(1),
    guestName: z.string().min(1).max(120),
    guestEmail: z.string().email(),
    guestPhone: z.string().max(32).optional(),
    note: z.string().max(2000).optional(),
  });
  const p = schema.safeParse(input);
  if (!p.success) throw new Error("פרטים לא תקינים");

  const start = new Date(p.data.slotStart);
  const end = new Date(p.data.slotEnd);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    throw new Error("מועד לא תקין");
  }

  const profile = await prisma.therapistProfile.findFirst({
    where: { id: p.data.therapistProfileId, userId: p.data.therapistUserId },
  });
  if (!profile) throw new Error("מטפל לא נמצא");

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("יש להתחבר עם Google כדי לקבוע פגישה");
  }

  await prisma.appointmentRequest.create({
    data: {
      therapistId: p.data.therapistUserId,
      clientUserId: session.user.id,
      guestName: (session.user.name ?? p.data.guestName).trim(),
      guestEmail: (session.user.email ?? p.data.guestEmail).trim().toLowerCase(),
      guestPhone: p.data.guestPhone?.trim() || null,
      slotStart: start,
      slotEnd: end,
      note: p.data.note?.trim() || null,
      status: "pending",
    },
  });

  revalidatePath(`/therapists/${profile.id}`);
}

export async function getTherapistAvailabilityForEdit(): Promise<WeeklyAvailability> {
  const session = await auth();
  if (!session?.user?.id) return {};
  const profile = await prisma.therapistProfile.findUnique({
    where: { userId: session.user.id },
    select: { weeklyAvailability: true },
  });
  return parseWeeklyAvailability(profile?.weeklyAvailability);
}

export type TherapistDashboardAppointment = {
  id: string;
  guestName: string;
  guestEmail: string;
  slotStart: string;
  slotEnd: string;
  status: string;
  recurringWeekly: boolean;
};

export async function getTherapistScheduleDashboardData(): Promise<{
  availability: WeeklyAvailability;
  openUntil: string | null;
  appointments: TherapistDashboardAppointment[];
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { availability: {}, openUntil: null, appointments: [] };
  }

  const profile = await prisma.therapistProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      weeklyAvailability: true,
      availabilityOpenUntil: true,
    },
  });

  const appointments = await prisma.appointmentRequest.findMany({
    where: { therapistId: session.user.id },
    orderBy: { slotStart: "asc" },
    take: 80,
    select: {
      id: true,
      guestName: true,
      guestEmail: true,
      slotStart: true,
      slotEnd: true,
      status: true,
      recurringWeekly: true,
    },
  });

  return {
    availability: parseWeeklyAvailability(profile?.weeklyAvailability),
    openUntil: profile?.availabilityOpenUntil
      ? profile.availabilityOpenUntil.toISOString().slice(0, 10)
      : null,
    appointments: appointments.map((a) => ({
      id: a.id,
      guestName: a.guestName,
      guestEmail: a.guestEmail,
      slotStart: a.slotStart.toISOString(),
      slotEnd: a.slotEnd.toISOString(),
      status: a.status,
      recurringWeekly: a.recurringWeekly,
    })),
  };
}

export async function getTherapistAppointmentsForDashboard(): Promise<TherapistDashboardAppointment[]> {
  const data = await getTherapistScheduleDashboardData();
  return data.appointments;
}

export async function saveTherapistScheduleSettings(input: {
  availability: WeeklyAvailability;
  openUntil: string | null;
}): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("יש להתחבר");

  const profile = await prisma.therapistProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) throw new Error("פרופיל מטפל לא נמצא");

  let openUntilDate: Date | null = null;
  if (input.openUntil) {
    openUntilDate = new Date(`${input.openUntil}T23:59:59`);
    if (Number.isNaN(openUntilDate.getTime())) throw new Error("תאריך לא תקין");
  }

  await prisma.therapistProfile.update({
    where: { id: profile.id },
    data: {
      weeklyAvailability: input.availability,
      availabilityOpenUntil: openUntilDate,
    },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath(`/therapists/${profile.id}`);
}

export async function setAppointmentRecurringWeekly(id: string, recurringWeekly: boolean): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("יש להתחבר");

  const row = await prisma.appointmentRequest.findFirst({
    where: { id, therapistId: session.user.id },
  });
  if (!row) throw new Error("פגישה לא נמצאה");

  const profile = await prisma.therapistProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  await prisma.appointmentRequest.update({
    where: { id },
    data: { recurringWeekly },
  });

  const profileId = profile?.id;
  if (profileId) revalidatePath(`/therapists/${profileId}`);
  revalidatePath("/dashboard/profile");
}
