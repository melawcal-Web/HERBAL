"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseWeeklyAvailability, type WeeklyAvailability } from "@/lib/therapist-availability";
import { parseCalendarSlotDefinitions, type CalendarSlotDefinition } from "@/lib/calendar-slot-definitions";
import { sendSiteTransactionalEmail } from "@/lib/site-mail";
import { logMeetingRequestReferral } from "@/app/actions/therapist-referrals";

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
    throw new Error("יש להתחבר כדי לקבוע פגישה");
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
      kind: "time_slot",
    },
  });

  revalidatePath(`/therapists/${profile.id}`);
}

const openInquirySchema = z.object({
  therapistUserId: z.string().min(1),
  therapistProfileId: z.string().min(1),
  message: z.string().min(3).max(2000),
  guestPhone: z.string().max(32).optional(),
});

/**
 * בקשת פגישה כללית כשאין מועדים ביומן — נשמרת במערכת, נרשמת בדוח פניות, ונשלחת במייל למטפל (אם Resend מוגדר).
 */
export async function submitOpenMeetingInquiry(input: z.infer<typeof openInquirySchema>): Promise<{ emailSent: boolean }> {
  const p = openInquirySchema.safeParse(input);
  if (!p.success) throw new Error("פרטים לא תקינים");

  const session = await auth();
  if (!session?.user?.id) throw new Error("יש להתחבר");

  const profile = await prisma.therapistProfile.findFirst({
    where: {
      id: p.data.therapistProfileId,
      userId: p.data.therapistUserId,
      user: {
        OR: [{ role: "admin" }, { AND: [{ role: "therapist" }, { therapistVerification: "approved" }] }],
      },
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!profile) throw new Error("מטפל לא נמצא");
  if (session.user.id === profile.userId) throw new Error("לא ניתן לשלוח בקשה לעצמך");

  const clientRow = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true },
  });
  if (!clientRow) throw new Error("משתמש לא נמצא");

  const guestName = (session.user.name?.trim() || clientRow.name).slice(0, 120);
  const guestEmail = (session.user.email ?? clientRow.email).trim().toLowerCase();
  const guestPhone = (p.data.guestPhone?.trim() || clientRow.phone?.trim() || "").slice(0, 64) || null;

  const now = new Date();
  const placeholderEnd = new Date(now.getTime() + 60_000);

  await prisma.appointmentRequest.create({
    data: {
      therapistId: profile.userId,
      clientUserId: session.user.id,
      guestName,
      guestEmail,
      guestPhone,
      slotStart: now,
      slotEnd: placeholderEnd,
      kind: "open_inquiry",
      status: "pending",
      note: p.data.message.trim(),
    },
  });

  await logMeetingRequestReferral({
    therapistProfileId: profile.id,
    note: p.data.message.trim(),
    guestPhone,
  });

  const therapistAccountEmail = profile.user.email.trim().toLowerCase();
  const bodyLines = [
    `שלום ${profile.user.name},`,
    "",
    "הגיעה בקשת פגישה מהאתר (ללא מועד ספציפי ביומן המקוון).",
    "",
    `שם המטופל: ${guestName}`,
    `אימייל: ${guestEmail}`,
    `נייד: ${guestPhone ?? "לא צוין"}`,
    "",
    "תוכן הבקשה:",
    p.data.message.trim(),
    "",
    `מזהה פרופיל ציבורי: /therapists/${profile.id}`,
  ];
  const mail = await sendSiteTransactionalEmail({
    to: therapistAccountEmail,
    subject: `בקשת פגישה מהאתר — ${guestName}`,
    text: bodyLines.join("\n"),
  });

  revalidatePath(`/therapists/${profile.id}`);
  revalidatePath("/dashboard/profile");

  return { emailSent: mail.ok };
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
  kind: "time_slot" | "open_inquiry";
};

export async function getTherapistScheduleDashboardData(): Promise<{
  availability: WeeklyAvailability;
  definitions: CalendarSlotDefinition[];
  appointments: TherapistDashboardAppointment[];
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { availability: {}, definitions: [], appointments: [] };
  }

  const profile = await prisma.therapistProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      weeklyAvailability: true,
      calendarSlotDefinitions: true,
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
      kind: true,
    },
  });

  function safeIso(d: Date, fallback: string): string {
    const t = d.getTime();
    if (Number.isNaN(t)) return fallback;
    try {
      return d.toISOString();
    } catch {
      return fallback;
    }
  }

  return {
    availability: parseWeeklyAvailability(profile?.weeklyAvailability),
    definitions: parseCalendarSlotDefinitions(profile?.calendarSlotDefinitions),
    appointments: appointments
      .map((a) => {
        const slotStart = safeIso(a.slotStart, "");
        const slotEnd = safeIso(a.slotEnd, "");
        if (!slotStart || !slotEnd) return null;
        return {
          id: a.id,
          guestName: a.guestName,
          guestEmail: a.guestEmail,
          slotStart,
          slotEnd,
          status: a.status,
          recurringWeekly: a.recurringWeekly,
          kind: a.kind,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row != null),
  };
}

export async function getTherapistAppointmentsForDashboard(): Promise<TherapistDashboardAppointment[]> {
  const data = await getTherapistScheduleDashboardData();
  return data.appointments;
}

export async function saveTherapistScheduleSettings(input: {
  definitions: CalendarSlotDefinition[];
  weeklyFallback: WeeklyAvailability;
}): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("יש להתחבר");

  const profile = await prisma.therapistProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) throw new Error("פרופיל מטפל לא נמצא");

  const defs = input.definitions.filter((d) => d.id && d.startISO && d.endISO);
  const useDefs = defs.length > 0;

  await prisma.therapistProfile.update({
    where: { id: profile.id },
    data: {
      availabilityOpenUntil: null,
      calendarSlotDefinitions: useDefs ? defs : Prisma.DbNull,
      weeklyAvailability: useDefs ? {} : input.weeklyFallback,
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
  if (row.kind !== "time_slot") throw new Error("לא ניתן לסמן חזרה שבועית לבקשה כללית");

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
