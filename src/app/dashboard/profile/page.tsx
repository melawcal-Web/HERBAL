import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { assertTherapist, therapistCanEditProfile } from "@/lib/formula";
import { therapistPublicHref } from "@/lib/therapist-public";
import { ProfileForm } from "./profile-form";
import { TherapistSchedulePanel } from "@/components/dashboard/TherapistSchedulePanel";
import { CertificateUploadPanel } from "@/components/dashboard/CertificateUploadPanel";
import { getTherapistScheduleDashboardData } from "@/app/actions/appointments";

function parseTimelineForForm(raw: unknown): { yearFrom: string; yearTo: string; description: string }[] {
  if (!Array.isArray(raw)) return [];
  const out: { yearFrom: string; yearTo: string; description: string }[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const yearFrom = typeof o.yearFrom === "number" ? String(Math.floor(o.yearFrom)) : typeof o.yearFrom === "string" ? o.yearFrom : "";
    const yearTo = typeof o.yearTo === "number" ? String(Math.floor(o.yearTo)) : typeof o.yearTo === "string" ? o.yearTo : "";
    const description = typeof o.description === "string" ? o.description : "";
    out.push({ yearFrom, yearTo, description });
  }
  return out;
}

export default async function TherapistProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  if (!assertTherapist(session.user.role)) redirect("/herbal-index");

  const profile = await prisma.therapistProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: { select: { image: true, therapistVerification: true, certificateUrl: true } },
    },
  });
  if (!profile) redirect("/auth/signin");

  const contact = profile.contactInfo as {
    phone?: string;
    city?: string;
    whatsapp?: string;
    email?: string;
  };
  const social = profile.socialLinks as {
    website?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };

  const certificateUrl = profile.user.certificateUrl;
  const canEdit = therapistCanEditProfile(session.user.role, certificateUrl);
  const pendingApproval =
    session.user.role === "therapist" && profile.user.therapistVerification === "pending_approval";
  const rejected =
    session.user.role === "therapist" && profile.user.therapistVerification === "rejected";
  const awaitingCertificate = session.user.role === "therapist" && !canEdit;

  let schedule: Awaited<ReturnType<typeof getTherapistScheduleDashboardData>> = {
    availability: {},
    definitions: [],
    appointments: [],
  };
  if (canEdit) {
    try {
      schedule = await getTherapistScheduleDashboardData();
    } catch {
      // נתוני יומן לא קריטיים
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-herbal-900">פרופיל מטפל/ת</h1>
      <p className="mt-2 text-slate-600">
        הדף הציבורי:{" "}
        <code className="rounded bg-herbal-50 px-1.5 py-0.5 text-sm" dir="ltr">
          {therapistPublicHref(profile.id)}
        </code>{" "}
        (קישור ישן{" "}
        <code className="rounded bg-herbal-50 px-1.5 py-0.5 text-sm" dir="ltr">
          /t/{profile.slug}
        </code>{" "}
        מפנה לכאן)
      </p>

      {awaitingCertificate ? (
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
          כדי לערוך את הפרופיל יש להעלות תמונת תעודה. אחרי ההעלאה תוכלו להשלים פרטים; צוות המרכז יאשר את התעודה בנפרד לפני פרסום ציבורי ו-EMR.
        </p>
      ) : null}

      {pendingApproval && canEdit ? (
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
          התעודה ממתינה לאישור צוות המרכז. ניתן להשלים את הפרופיל כאן; הדף הציבורי והאינדקס יופעלו לאחר האישור.
        </p>
      ) : null}

      {rejected ? (
        <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-950">
          אישור התעודה נדחה או בוטל. העלו תעודה מעודכנת או צרו קשר עם המרכז.
        </p>
      ) : null}

      {session.user.role === "therapist" ? (
        <CertificateUploadPanel initialUrl={certificateUrl} />
      ) : null}

      {canEdit ? (
        <>
          <div className="mt-8">
            <ProfileForm
              key={profile.updatedAt.toISOString()}
              initial={{
                slug: profile.slug,
                bio: profile.bio ?? "",
                specialty1: profile.specialty1 ?? "",
                specialty2: profile.specialty2 ?? "",
                specialty3: profile.specialty3 ?? "",
                publicTherapistTitle: profile.publicTherapistTitle === "male" ? "male" : "female",
                profileImageUrl: profile.user.image ?? "",
                acceptsSupervisionRequests: profile.acceptsSupervisionRequests ?? false,
                supervisionHourlyRate:
                  profile.supervisionHourlyRate != null ? String(Number(profile.supervisionHourlyRate)) : "",
                contactPhone: contact.phone ?? "",
                contactCity: contact.city ?? "",
                contactWhatsapp: contact.whatsapp ?? "",
                contactPublicEmail: contact.email ?? "",
                website: social.website ?? "",
                instagram: social.instagram ?? "",
                facebook: social.facebook ?? "",
                tiktok: social.tiktok ?? "",
                showPublicCalendar: profile.showPublicCalendar ?? false,
                portfolioTimeline: parseTimelineForForm(profile.portfolioTimeline),
              }}
            />
          </div>
          <TherapistSchedulePanel
            initialAvailability={schedule.availability}
            initialDefinitions={schedule.definitions}
            initialAppointments={schedule.appointments}
          />
        </>
      ) : null}
    </div>
  );
}
