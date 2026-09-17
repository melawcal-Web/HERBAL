"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assertTherapist } from "@/lib/formula";
import { writeAudit } from "@/lib/audit";
import {
  emptyTherapistPaymentSettings,
  isHttpsPaymentLink,
  normalizeIlMobile,
  parseTherapistPaymentSettings,
  type TherapistPaymentMethodConfig,
  type TherapistPaymentSettings,
} from "@/lib/therapist-payments";

function cleanMethod(
  input: TherapistPaymentMethodConfig,
  opts?: { requireLink?: boolean },
): TherapistPaymentMethodConfig {
  const phoneRaw = input.phone.trim();
  const linkRaw = input.paymentLink.trim();
  const phone = phoneRaw ? normalizeIlMobile(phoneRaw) : null;
  if (phoneRaw && !phone) {
    throw new Error("מספר טלפון לתשלום חייב להיות נייד ישראלי תקין (05xxxxxxxx)");
  }
  if (linkRaw && !isHttpsPaymentLink(linkRaw)) {
    throw new Error("קישור תשלום חייב להתחיל ב-https");
  }
  if (opts?.requireLink && input.enabled && !linkRaw) {
    throw new Error("קישור Grow / סליקה חייב להיות כתובת https");
  }
  const phoneOut = opts?.requireLink ? "" : (phone ?? "");
  const paymentLink = linkRaw;
  const enabled = Boolean(input.enabled) && Boolean(phoneOut || paymentLink);
  return { enabled, phone: phoneOut, paymentLink };
}

export async function getTherapistPaymentSettings(): Promise<TherapistPaymentSettings> {
  const session = await auth();
  if (!session?.user?.id || !assertTherapist(session.user.role)) {
    throw new Error("אין הרשאה");
  }
  const profile = await prisma.therapistProfile.findUnique({
    where: { userId: session.user.id },
    select: { paymentSettings: true },
  });
  return parseTherapistPaymentSettings(profile?.paymentSettings);
}

export async function updateTherapistPaymentSettings(input: TherapistPaymentSettings): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || !assertTherapist(session.user.role)) {
    throw new Error("אין הרשאה");
  }

  const next: TherapistPaymentSettings = {
    bit: cleanMethod(input.bit),
    paybox: cleanMethod(input.paybox),
    grow: cleanMethod(input.grow ?? emptyTherapistPaymentSettings().grow, { requireLink: true }),
  };

  const profile = await prisma.therapistProfile.update({
    where: { userId: session.user.id },
    data: { paymentSettings: next as unknown as Prisma.InputJsonValue },
    select: { id: true, slug: true },
  });

  await writeAudit({
    actorId: session.user.id,
    action: "therapist_payment_settings.update",
    entityType: "TherapistProfile",
    entityId: profile.id,
    metadata: {
      bitEnabled: next.bit.enabled,
      payboxEnabled: next.paybox.enabled,
      growEnabled: next.grow.enabled,
    },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/finance");
  revalidatePath("/therapists");
  revalidatePath(`/therapists/${profile.id}`);
  if (profile.slug) revalidatePath(`/t/${profile.slug}`);
}
