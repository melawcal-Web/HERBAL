"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assertTherapist } from "@/lib/formula";
import { writeAudit } from "@/lib/audit";
import type { PortfolioTimelineEntry } from "@/lib/portfolio-timeline";

/** JSON נקי ל־Prisma — ללא ערכים לא־סריאליים (מונע כשלים אחרי שמירה / רענון RSC). */
function portfolioTimelineJson(entries: PortfolioTimelineEntry[] | undefined): Prisma.InputJsonValue {
  if (!entries?.length) return [];
  const out: { id: string; yearFrom: string; yearTo?: string; description: string }[] = [];
  for (const e of entries) {
    const id = typeof e.id === "string" && e.id.trim() ? e.id.trim().slice(0, 80) : `tl-${out.length}`;
    const yearFrom = typeof e.yearFrom === "string" ? e.yearFrom.trim().slice(0, 8) : "";
    const yearTo = typeof e.yearTo === "string" ? e.yearTo.trim().slice(0, 8) : "";
    const description = typeof e.description === "string" ? e.description.trim().slice(0, 4000) : "";
    if (!yearFrom && !description) continue;
    const row: { id: string; yearFrom: string; yearTo?: string; description: string } = { id, yearFrom, description };
    if (yearTo) row.yearTo = yearTo;
    out.push(row);
  }
  return out as unknown as Prisma.InputJsonValue;
}

/** כתובת תמונה לשמירה — מאחדים URL מלא עם pathname של /uploads/ */
function normalizeProfileImageUrl(raw: string): string {
  let t = raw.trim();
  if (!t) return "";
  if (t.startsWith("//")) t = `https:${t}`;
  if (t.startsWith("http://")) t = `https://${t.slice(7)}`;
  if (t.startsWith("/uploads/") || t.startsWith("https://")) return t;
  if (t.startsWith("/api/blob-media")) return t;
  try {
    const u = new URL(t);
    if (u.pathname.startsWith("/uploads/")) return `${u.pathname}${u.search}`;
  } catch {
    /* לא URL מלא */
  }
  return t;
}

export async function updateTherapistProfile(input: {
  slug: string;
  bio: string;
  clinicalExperience: string;
  specialty1: string;
  specialty2: string;
  specialty3: string;
  /** כותרת ציבורית בדף המטפל */
  publicTherapistTitle: "male" | "female";
  /** תמונת פרופיל — URL https (למשל מ-Unsplash) */
  profileImageUrl: string | null;
  acceptsSupervisionRequests: boolean;
  supervisionHourlyRate: number | null;
  contactPhone: string;
  contactCity: string;
  contactWhatsapp: string;
  contactPublicEmail: string;
  website: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  portfolioTimeline?: PortfolioTimelineEntry[];
  /** הצגת יומן ציבורי בדף המטפל */
  showPublicCalendar: boolean;
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

  if (input.acceptsSupervisionRequests) {
    if (input.supervisionHourlyRate == null || Number.isNaN(input.supervisionHourlyRate) || input.supervisionHourlyRate <= 0) {
      throw new Error("כאשר מאפשרים השגחה, יש להזין מחיר לשעה חיובי");
    }
  }

  const img = normalizeProfileImageUrl(input.profileImageUrl ?? "");
  const okStored =
    img.startsWith("https://") ||
    img.startsWith("http://") ||
    img.startsWith("//") ||
    img.startsWith("/uploads/") ||
    img.startsWith("/api/blob-media");
  if (img.length > 0 && !okStored) {
    throw new Error("תמונת פרופיל חייבת להיות כתובת https או קובץ שהועלה למערכת");
  }

  const prev = await prisma.therapistProfile.findUnique({
    where: { userId: session.user.id },
    select: { slug: true, id: true },
  });

  await prisma.therapistProfile.update({
    where: { userId: session.user.id },
    data: {
      slug: input.slug,
      publicTherapistTitle: input.publicTherapistTitle,
      bio: input.bio,
      clinicalExperience: input.clinicalExperience.trim() || null,
      specialty1: input.specialty1,
      specialty2: input.specialty2,
      specialty3: input.specialty3,
      acceptsSupervisionRequests: input.acceptsSupervisionRequests,
      supervisionHourlyRate:
        input.acceptsSupervisionRequests && input.supervisionHourlyRate != null && input.supervisionHourlyRate > 0
          ? new Prisma.Decimal(input.supervisionHourlyRate)
          : null,
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
      portfolioTimeline: portfolioTimelineJson(input.portfolioTimeline),
      showPublicCalendar: input.showPublicCalendar,
    },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      image: img.length > 0 ? img : null,
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
  revalidatePath("/");
  if (prev?.slug) revalidatePath(`/t/${prev.slug}`);
  if (prev?.id) revalidatePath(`/therapists/${prev.id}`);
  if (nextProfile?.slug) revalidatePath(`/t/${nextProfile.slug}`);
  if (nextProfile?.id) revalidatePath(`/therapists/${nextProfile.id}`);
}
