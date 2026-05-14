import type { TherapistProfile, User } from "@prisma/client";
import { TherapistProfileHero } from "@/components/therapist/TherapistProfileHero";
import { parseContactInfo, parseSocialLinks } from "@/lib/therapist-contact";

type UserPick = Pick<User, "name" | "image">;
export type TherapistPublicProfile = TherapistProfile & { user: UserPick };

function specialtyList(s1: string, s2: string, s3: string) {
  return [s1, s2, s3].map((s) => s.trim()).filter(Boolean);
}

const sectionLabel = "text-[11px] font-bold uppercase tracking-[0.36em] text-herbal-800/80";

function moneyIls(n: number) {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(n);
}

export function TherapistPublicPageView({ profile }: { profile: TherapistPublicProfile }) {
  const contact = parseContactInfo(profile.contactInfo);
  const social = parseSocialLinks(profile.socialLinks);
  const specs = specialtyList(profile.specialty1, profile.specialty2, profile.specialty3);
  const city = contact.city?.trim() || null;

  const showSupervision =
    profile.acceptsSupervisionRequests && profile.supervisionHourlyRate != null && Number(profile.supervisionHourlyRate) > 0;

  return (
    <article className="mx-auto w-full max-w-[1320px] px-0 pb-12 pt-0 sm:px-4 sm:pb-16 md:px-6" dir="rtl">
      <header className="overflow-hidden rounded-none shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)] sm:rounded-[2rem] sm:shadow-xl">
        <TherapistProfileHero
          imageUrl={profile.user.image}
          fallbackLetter={profile.user.name.slice(0, 1)}
          therapistName={profile.user.name}
          serviceCity={city}
          specialties={specs}
          contact={contact}
          social={social}
        />
      </header>

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16 md:py-20">
        <section aria-labelledby="about-heading">
          <p className={sectionLabel}>ביוגרפיה</p>
          <h2 id="about-heading" className="sr-only">
            ביוגרפיה — {profile.user.name}
          </h2>
          <p className="mt-5 whitespace-pre-wrap text-base leading-[1.85] text-neutral-700 md:text-lg">{profile.bio}</p>
        </section>

        {showSupervision ? (
          <section className="mt-12 border-t border-neutral-200/90 pt-10" aria-labelledby="supervision-heading">
            <p id="supervision-heading" className={sectionLabel}>
              השגחה מקצועית
            </p>
            <p className="mt-4 text-base leading-relaxed text-neutral-700">
              המטפל/ת מאשר/ת פניות להשגחה מקצועית. תעריף מוצג לשעת עבודה אחת:{" "}
              <span className="font-semibold text-herbal-900">{moneyIls(Number(profile.supervisionHourlyRate))}</span>
              . לתיאום ופרטים נוספים ניתן ליצור קשר דרך האייקונים בראש הדף.
            </p>
          </section>
        ) : null}
      </div>
    </article>
  );
}
