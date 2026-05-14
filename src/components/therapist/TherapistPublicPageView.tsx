import Link from "next/link";
import type { HerbalArticle, TherapistProfile, User } from "@prisma/client";
import { CommunityBanner } from "@/components/CommunityBanner";
import { TherapistProfileContact } from "@/components/TherapistProfileContact";
import { TherapistProfileHero } from "@/components/therapist/TherapistProfileHero";
import { parseContactInfo, parseSocialLinks } from "@/lib/therapist-contact";

type UserPick = Pick<User, "name" | "image">;
export type TherapistPublicProfile = TherapistProfile & { user: UserPick };

function specialtyList(s1: string, s2: string, s3: string) {
  return [s1, s2, s3].map((s) => s.trim()).filter(Boolean);
}

const sectionLabel = "text-[11px] font-bold uppercase tracking-[0.36em] text-herbal-800/80";

export function TherapistPublicPageView({
  profile,
  articles,
}: {
  profile: TherapistPublicProfile;
  articles: Pick<HerbalArticle, "id" | "title" | "excerpt" | "slug">[];
}) {
  const contact = parseContactInfo(profile.contactInfo);
  const social = parseSocialLinks(profile.socialLinks);
  const specs = specialtyList(profile.specialty1, profile.specialty2, profile.specialty3);
  const city = contact.city?.trim() || null;
  const clinical = profile.clinicalExperience?.trim();

  return (
    <>
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

        <div className="mx-auto max-w-3xl space-y-14 px-4 py-14 sm:space-y-16 sm:px-6 sm:py-16 md:py-20">
          <section aria-labelledby="about-heading">
            <p className={sectionLabel}>אודותיי</p>
            <h2 id="about-heading" className="sr-only">
              אודות {profile.user.name}
            </h2>
            <p className="mt-5 whitespace-pre-wrap text-base leading-[1.85] text-neutral-700 md:text-lg">
              {profile.bio}
            </p>
          </section>

          {clinical ? (
            <section aria-labelledby="clinical-heading">
              <p className={sectionLabel}>ניסיון קליני והשכלה</p>
              <h2 id="clinical-heading" className="sr-only">
                ניסיון מקצועי
              </h2>
              <div className="mt-5 whitespace-pre-wrap text-base leading-[1.85] text-neutral-700 md:text-lg">{clinical}</div>
            </section>
          ) : null}

          <section aria-labelledby="contact-heading" className="border-t border-neutral-200/90 pt-12">
            <p id="contact-heading" className={sectionLabel}>
              פרטי התקשרות
            </p>
            <h2 className="sr-only">יצירת קשר</h2>
            <TherapistProfileContact contact={contact} social={social} appearance="minimal" />
          </section>

          <section className="border-t border-neutral-200/90 pt-12" aria-labelledby="articles-heading">
            <p className={sectionLabel}>מאמרים באינדקס הצמחים</p>
            <h2 id="articles-heading" className="sr-only">
              פרסומים
            </h2>
            {articles.length === 0 ? (
              <p className="mt-5 text-neutral-600">טרם פורסמו מאמרים.</p>
            ) : (
              <ul className="mt-6 space-y-1 divide-y divide-neutral-200/80">
                {articles.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/herbal-index/${a.slug}`}
                      className="group block py-5 transition first:pt-0 hover:text-herbal-800"
                    >
                      <span className="font-display text-lg font-semibold text-neutral-900 group-hover:text-herbal-800 md:text-xl">
                        {a.title}
                      </span>
                      <span className="mt-2 block max-w-2xl text-sm leading-relaxed text-neutral-600 md:text-base">
                        {a.excerpt}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            className="rounded-2xl border border-dashed border-herbal-300/70 bg-herbal-50/50 px-5 py-8 text-center sm:px-8"
            aria-labelledby="materials-heading"
          >
            <p id="materials-heading" className={sectionLabel}>
              חומרים שהועלו על ידי המטפל/ת
            </p>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-600">
              כאן יוצגו בעתיד מסמכים, מצגות וקבצים שהמטפל/ת משתף/ת עם המרכז והקהילה — תכונה בפיתוח.
            </p>
          </section>
        </div>
      </article>

      <div className="mx-auto w-full max-w-[1320px] px-4 pb-10 sm:px-6">
        <CommunityBanner therapistName={profile.user.name} />
      </div>
    </>
  );
}
