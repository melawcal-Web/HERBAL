"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assertTherapist } from "@/lib/formula";
import { writeAudit } from "@/lib/audit";

export async function updateTherapistProfile(input: {
  slug: string;
  bio: string;
  clinicalExperience: string;
  specialty1: string;
  specialty2: string;
  specialty3: string;
  contactPhone: string;
  contactCity: string;
  contactWhatsapp: string;
  contactPublicEmail: string;
  website: string;
  instagram: string;
  facebook: string;
  tiktok: string;
}) {
  const session = await auth();
  if (!session?.user?.id || !assertTherapist(session.user.role)) {
    throw new Error("אין הרשאה");
  }

  const slugTaken = await prisma.therapistProfile.findFirst({
    where: { slug: input.slug, NOT: { userId: session.user.id } },
  });
  if (slugTaken) {
    throw new Error("כתובת הדף (slug) תפוסה");
  }

  const prev = await prisma.therapistProfile.findUnique({
    where: { userId: session.user.id },
    select: { slug: true, id: true },
  });

  await prisma.therapistProfile.update({
    where: { userId: session.user.id },
    data: {
      slug: input.slug,
      bio: input.bio,
      clinicalExperience: input.clinicalExperience.trim() || null,
      specialty1: input.specialty1,
      specialty2: input.specialty2,
      specialty3: input.specialty3,
      contactInfo: {
        phone: input.contactPhone,
        city: input.contactCity,
        whatsapp: input.contactWhatsapp,
        email: input.contactPublicEmail,
      },
      socialLinks: {
        website: input.website,
        instagram: input.instagram,
        facebook: input.facebook,
        tiktok: input.tiktok,
      },
    },
  });

  await writeAudit({
    actorId: session.user.id,
    action: "therapist_profile.update",
    entityType: "TherapistProfile",
    entityId: session.user.id,
    metadata: { fromSlug: prev?.slug, toSlug: input.slug },
  });

  const nextProfile = await prisma.therapistProfile.findUnique({
    where: { userId: session.user.id },
    select: { slug: true, id: true },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/therapists");
  if (prev?.slug) revalidatePath(`/t/${prev.slug}`);
  if (prev?.id) revalidatePath(`/therapists/${prev.id}`);
  if (nextProfile?.slug) revalidatePath(`/t/${nextProfile.slug}`);
  if (nextProfile?.id) revalidatePath(`/therapists/${nextProfile.id}`);
}
