"use server";

import type { ReferralChannel, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { therapistPublicHref } from "@/lib/therapist-public";
import {
  buildMailto,
  buildTelHref,
  buildWhatsAppHref,
  isProbablyValidEmail,
  parseContactInfo,
} from "@/lib/therapist-contact";

function clientAdminPathFor(userId: string): string {
  return `/admin/users#admin-user-${userId}`;
}

/**
 * רישום פניית לקוח למטפל (טלפון / מייל / וואטסאפ) והחזרת כתובת היעד לפתיחה.
 * אדמין: ללא רישום. מטפל שפותח את הפרופיל שלו: ללא רישום.
 */
export async function logTherapistContactReferral(input: {
  therapistProfileId: string;
  channel: ReferralChannel;
}): Promise<{ url: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("יש להתחבר כדי ליצור קשר מתועד");
  }

  const profile = await prisma.therapistProfile.findFirst({
    where: {
      id: input.therapistProfileId,
      user: {
        OR: [{ role: "admin" }, { AND: [{ role: "therapist" }, { therapistVerification: "approved" }] }],
      },
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!profile) throw new Error("מטפל/ת לא נמצא/ה");

  const contact = parseContactInfo(profile.contactInfo);
  const wa = contact.whatsapp ? buildWhatsAppHref(contact.whatsapp) : null;
  const phone = contact.phone?.trim();
  const email = contact.email?.trim();

  let url: string;
  if (input.channel === "whatsapp") {
    if (!wa) throw new Error("אין וואטסאפ ליצירת קשר");
    url = wa;
  } else if (input.channel === "phone") {
    if (!phone) throw new Error("אין טלפון ליצירת קשר");
    url = buildTelHref(phone);
  } else {
    if (!email || !isProbablyValidEmail(email)) throw new Error("אין אימייל ליצירת קשר");
    url = buildMailto(email);
  }

  const viewerRole = session.user.role as UserRole;
  const shouldLog = viewerRole === "client" && session.user.id !== profile.userId;

  if (shouldLog) {
    const clientRow = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    });
    if (clientRow) {
      const displayName = (session.user.name?.trim() || clientRow.name || clientRow.email || "לקוח/ה").slice(0, 200);
      await prisma.therapistReferral.create({
        data: {
          therapistProfileId: profile.id,
          therapistUserId: profile.userId,
          therapistNameSnapshot: profile.user.name.slice(0, 200),
          therapistPublicPath: therapistPublicHref(profile.id).slice(0, 256),
          clientUserId: session.user.id,
          clientNameSnapshot: displayName,
          clientEmailSnapshot: clientRow.email.slice(0, 320),
          clientPhoneSnapshot: null,
          clientAdminPath: clientAdminPathFor(session.user.id).slice(0, 320),
          channel: input.channel,
        },
      });
      revalidatePath("/admin/referrals");
    }
  }

  return { url };
}
