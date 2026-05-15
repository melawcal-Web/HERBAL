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

  await prisma.appointmentRequest.create({
    data: {
      therapistId: p.data.therapistUserId,
      clientUserId: session?.user?.id ?? null,
      guestName: p.data.guestName.trim(),
      guestEmail: p.data.guestEmail.trim().toLowerCase(),
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
