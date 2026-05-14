import Link from "next/link";
import type { TherapistProfile, User } from "@prisma/client";
import { TherapistProfileHero } from "@/components/therapist/TherapistProfileHero";
import { parseContactInfo, parseSocialLinks } from "@/lib/therapist-contact";
import { pickDemoImage } from "@/lib/demo-placeholders";

type UserPick = Pick<User, "id" | "name" | "image">;
export type TherapistPublicProfile = TherapistProfile & { user: UserPick };

export type TherapistPublishedArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string | null;
};

function specialtyList(s1: string, s2: string, s3: string) {
  return [s1, s2, s3].map((s) => s.trim()).filter(Boolean);
}

const sectionLabel = "text-[11px] font-bold uppercase tracking-[0.36em] text-herbal-800/80";

function moneyIls(n: number) {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(n);
}

export function TherapistPublicPageView({
  profile,
  articles = [],
}: {
  profile: TherapistPublicProfile;
  articles?: TherapistPublishedArticle[];
}) {
  const contact = parseContactInfo(profile.contactInfo);
  const social = parseSocialLinks(profile.socialLinks);
  const specs = specialtyList(profile.specialty1, profile.specialty2, profile.specialty3);
  const city = contact.city?.trim() || null;
  const publicTherapistTitle = profile.publicTherapistTitle === "male" ? "male" : "female";

  const rawImg = profile.user.image?.trim();
  const heroCoverUrl =
    rawImg?.startsWith("https://") ? rawImg : pickDemoImage(`therapist-hero-${profile.id}`, "therapists");

  const showSupervision =
    profile.acceptsSupervisionRequests && profile.supervisionHourlyRate != null && Number(profile.supervisionHourlyRate) > 0;

  return (
    <article className="mx-auto w-full max-w-[1320px] px-0 pb-12 pt-0 sm:px-4 sm:pb-16 md:px-6" dir="rtl">
      <header className="overflow-hidden rounded-none shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)] sm:rounded-[2rem] sm:shadow-xl">
        <TherapistProfileHero
          heroCoverUrl={heroCoverUrl}
          therapistName={profile.user.name}
          serviceCity={city}
          specialties={specs}
          contact={contact}
          social={social}
          publicTherapistTitle={publicTherapistTitle}
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

        {articles.length > 0 ? (
          <section className="mt-14 border-t border-neutral-200/90 pt-12" aria-labelledby="articles-heading">
            <p id="articles-heading" className={sectionLabel}>
              מאמרים שפורסמו
            </p>
            <div
              className="hero-vision-hide-scrollbar mt-6 flex gap-4 overflow-x-auto pb-2 pt-1 [-webkit-overflow-scrolling:touch]"
              dir="ltr"
              style={{ scrollSnapType: "x proximity" }}
            >
              {articles.map((a) => (
                <Link
                  key={a.id}
                  href={`/herbal-index/${a.slug}`}
                  className="w-[min(280px,82vw)] shrink-0 scroll-ml-4 snap-start overflow-hidden rounded-2xl border border-herbal-100 bg-white shadow-sm transition hover:border-herbal-300 hover:shadow-md"
                  dir="ltr"
                >
                  <div className="aspect-[16/10] w-full bg-herbal-50">
                    {a.coverImageUrl?.startsWith("https://") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.coverImageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-medium text-herbal-600">
                        מאמר
                      </div>
                    )}
                  </div>
                  <div className="p-4 text-right" dir="rtl">
                    <h3 className="font-display text-base font-bold text-herbal-900">{a.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{a.excerpt}</p>
                    <span className="mt-3 inline-block text-xs font-semibold text-herbal-700">לקריאה ←</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

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
