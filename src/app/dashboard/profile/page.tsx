import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { assertTherapist } from "@/lib/formula";
import { therapistPublicHref } from "@/lib/therapist-public";
import { ProfileForm } from "./profile-form";

export default async function TherapistProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  if (!assertTherapist(session.user.role)) redirect("/dashboard");

  const profile = await prisma.therapistProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) redirect("/dashboard");

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
      <div className="mt-8">
        <ProfileForm
          initial={{
            slug: profile.slug,
            bio: profile.bio ?? "",
            clinicalExperience: profile.clinicalExperience ?? "",
            specialty1: profile.specialty1 ?? "",
            specialty2: profile.specialty2 ?? "",
            specialty3: profile.specialty3 ?? "",
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
          }}
        />
      </div>
    </div>
  );
}
