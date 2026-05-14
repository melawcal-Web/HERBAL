import Link from "next/link";
import type { HerbalArticle, TherapistProfile, User } from "@prisma/client";
import { CommunityBanner } from "@/components/CommunityBanner";
import { TherapistProfileContact } from "@/components/TherapistProfileContact";
import { TherapistProfileHero } from "@/components/therapist/TherapistProfileHero";
import { parseContactInfo, parseSocialLinks } from "@/lib/therapist-contact";

type UserPick = Pick<User, "name" | "image">;
export type TherapistPublicProfile = TherapistProfile & { user: UserPick };

function specialtyLine(s1: string, s2: string, s3: string) {
  return [s1, s2, s3].filter(Boolean).join(" · ");
}

function specialtyList(s1: string, s2: string, s3: string) {
  return [s1, s2, s3].map((s) => s.trim()).filter(Boolean);
}

export function TherapistPublicPageView({
  profile,
  articles,
}: {
  profile: TherapistPublicProfile;
  articles: Pick<HerbalArticle, "id" | "title" | "excerpt" | "slug">[];
}) {
  const contact = parseContactInfo(profile.contactInfo);
  const social = parseSocialLinks(profile.socialLinks);
  const spec = specialtyLine(profile.specialty1, profile.specialty2, profile.specialty3);
  const specs = specialtyList(profile.specialty1, profile.specialty2, profile.specialty3);

  return (
    <>
      <article className="mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-10 md:pt-14" dir="rtl">
        <header className="mb-16 md:mb-24">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 sm:aspect-[5/6] md:aspect-[16/9] md:max-h-[min(56vh,560px)]">
            <TherapistProfileHero
              imageUrl={profile.user.image}
              fallbackLetter={profile.user.name.slice(0, 1)}
            />
          </div>

          <div className="mt-10 md:mt-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-500">מטפל/ת צמחי מרפא</p>
            <h1 className="mt-5 font-display text-[clamp(2.1rem,5.5vw,3.5rem)] font-bold leading-[1.08] tracking-tight text-neutral-950">
              {profile.user.name}
            </h1>
            {spec ? (
              <p className="mt-5 max-w-3xl text-lg font-semibold leading-snug text-neutral-800 md:text-2xl md:leading-snug">
                {spec}
              </p>
            ) : null}
          </div>
        </header>

        <div className="space-y-16 md:space-y-20">
          <section aria-labelledby="bio-heading">
            <p className="text-[11px] font-bold uppercase tracking-[0.38em] text-herbal-700/75">אודות</p>
            <h2 id="bio-heading" className="sr-only">
              אודות {profile.user.name}
            </h2>
            <p className="mt-6 max-w-3xl whitespace-pre-wrap text-base leading-[1.75] text-neutral-700 md:text-lg md:leading-[1.8]">
              {profile.bio}
            </p>
          </section>

          {specs.length > 0 ? (
            <section aria-labelledby="spec-heading">
              <p id="spec-heading" className="text-[11px] font-bold uppercase tracking-[0.38em] text-herbal-700/75">
                התמחויות
              </p>
              <ul className="mt-6 flex flex-wrap gap-2.5">
                {specs.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-neutral-900/10 bg-white px-4 py-2 text-sm font-medium text-neutral-800"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <TherapistProfileContact contact={contact} social={social} appearance="minimal" />

          <section className="border-t border-neutral-200/90 pt-14 md:pt-16" aria-labelledby="articles-heading">
            <p className="text-[11px] font-bold uppercase tracking-[0.38em] text-neutral-500">מאמרים באינדקס הצמחים</p>
            <h2 id="articles-heading" className="sr-only">
              פרסומים
            </h2>
            {articles.length === 0 ? (
              <p className="mt-6 text-neutral-600">טרם פורסמו מאמרים.</p>
            ) : (
              <ul className="mt-8 space-y-1 divide-y divide-neutral-200/80">
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
        </div>
      </article>

      <div className="mx-auto max-w-4xl px-4 pb-10 sm:px-6">
        <CommunityBanner therapistName={profile.user.name} />
      </div>
    </>
  );
}
