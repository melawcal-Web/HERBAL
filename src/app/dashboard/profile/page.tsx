import { auth } from "@/auth";

import { prisma } from "@/lib/prisma";

import { redirect } from "next/navigation";

import { assertTherapist } from "@/lib/formula";

import { therapistPublicHref } from "@/lib/therapist-public";

import { ProfileForm } from "./profile-form";
import { TherapistSchedulePanel } from "@/components/dashboard/TherapistSchedulePanel";
import { getTherapistScheduleDashboardData } from "@/app/actions/appointments";



export default async function TherapistProfilePage() {

  const session = await auth();

  if (!session?.user?.id) redirect("/auth/signin");

  if (!assertTherapist(session.user.role)) redirect("/herbal-index");



  const profile = await prisma.therapistProfile.findUnique({

    where: { userId: session.user.id },

    include: { user: { select: { image: true, therapistVerification: true } } },

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



  const pendingApproval =

    session.user.role === "therapist" && session.user.therapistVerification === "pending_approval";

  const rejected = session.user.role === "therapist" && session.user.therapistVerification === "rejected";

  let schedule: Awaited<ReturnType<typeof getTherapistScheduleDashboardData>> = {
    availability: {},
    definitions: [],
    openUntil: null,
    appointments: [],
  };
  try {
    schedule = await getTherapistScheduleDashboardData();
  } catch {
    // נתוני יומן לא קריטיים לטעינת הפרופיל — מונעים כשל RSC אם יש שורות עם תאריכים פגומים ב־DB
  }

  return (

    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">

      <h1 className="font-display text-3xl text-herbal-900">פרופיל מטפל/ת</h1>

      <p className="mt-2 text-slate-600">

        הדף הציבורי:{" "}

        <code className="rounded bg-herbal-50 px-1.5 py-0.5 text-sm" dir="ltr">

          {therapistPublicHref(profile.id)}

        </code>{" "}

        (קישור ישן <code className="rounded bg-herbal-50 px-1.5 py-0.5 text-sm" dir="ltr">/t/{profile.slug}</code> מפנה לכאן)

      </p>



      {pendingApproval ? (

        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">

          חשבון המטפל ממתין לאישור תעודה על ידי צוות המרכז. ניתן להשלים את הפרופיל כאן; הדף הציבורי והאינדקס יופעלו לאחר האישור.

        </p>

      ) : null}

      {rejected ? (

        <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-950">

          אישור התעודה נדחה או בוטל. לפרטים והמשך תהליך צרו קשר עם המרכז.

        </p>

      ) : null}



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

          }}

        />

      </div>

      <TherapistSchedulePanel
        initialAvailability={schedule.availability}
        initialDefinitions={schedule.definitions}
        initialOpenUntil={schedule.openUntil}
        initialAppointments={schedule.appointments}
      />

    </div>

  );

}

