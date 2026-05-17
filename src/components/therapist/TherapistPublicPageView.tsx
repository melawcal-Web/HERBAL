import Link from "next/link";
import { Suspense } from "react";
import type { TherapistProfile, User } from "@prisma/client";
import { TherapistProfileHero } from "@/components/therapist/TherapistProfileHero";
import { TherapistOfferingSections } from "@/components/therapist/TherapistOfferingSections";
import { TherapistAppointmentCalendar } from "@/components/therapist/TherapistAppointmentCalendar";
import { ContentSearchFilter } from "@/components/search/ContentSearchFilter";
import {
  buildMailto,
  buildTelHref,
  buildWhatsAppHref,
  isProbablyValidEmail,
  parseContactInfo,
  parseSocialLinks,
} from "@/lib/therapist-contact";
import { pickDemoImage } from "@/lib/demo-placeholders";
import type { WaitlistProductModel } from "@/components/products/WaitlistProductCard";
import { expandBookedAppointments, parseWeeklyAvailability, type WeeklyAvailability } from "@/lib/therapist-availability";
import {
  filterArticleRow,
  filterProductRow,
  type ContentSearchParams,
} from "@/lib/content-search";
import { contentVisibleForViewer, type ContentViewer } from "@/lib/content-audience";
import type { ContentFilterType } from "@/components/search/ContentSearchFilter";
import { publicDisplayImageUrl } from "@/lib/blob-image-url";
import { isStoredImageUrl, normalizeHttpsImageReference } from "@/lib/stored-image-url";

type UserPick = Pick<User, "id" | "name" | "image">;
export type TherapistPublicProfile = TherapistProfile & { user: UserPick };

export type TherapistPublishedArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string | null;
  coverImageUrl: string | null;
  tags?: unknown;
  audience?: unknown;
  therapistId: string;
};

const sectionLabel = "text-[11px] font-bold uppercase tracking-[0.36em] text-herbal-800/80";

function specialtyList(s1: string, s2: string, s3: string) {
  return [s1, s2, s3].map((s) => s.trim()).filter(Boolean);
}

function moneyIls(n: number) {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(n);
}

export function TherapistPublicPageView({
  profile,
  articles = [],
  products = [],
  searchParams = {},
  openUntil = null,
  bookedAppointments = [],
  viewer = null,
}: {
  profile: TherapistPublicProfile;
  articles?: TherapistPublishedArticle[];
  products?: WaitlistProductModel[];
  searchParams?: {
    q?: string;
    tag?: string;
    type?: string;
  };
  openUntil?: Date | null;
  bookedAppointments?: { slotStart: Date; slotEnd: Date; recurringWeekly: boolean; status: string }[];
  viewer?: ContentViewer | null;
}) {
  const contact = parseContactInfo(profile.contactInfo);
  const social = parseSocialLinks(profile.socialLinks);
  const specs = specialtyList(profile.specialty1, profile.specialty2, profile.specialty3);
  const city = contact.city?.trim() || null;
  const publicTherapistTitle = profile.publicTherapistTitle === "male" ? "male" : "female";

  const rawImg = profile.user.image?.trim() ?? "";
  const heroBase = isStoredImageUrl(rawImg)
    ? normalizeHttpsImageReference(rawImg)
    : pickDemoImage(`therapist-hero-${profile.id}`, "therapists");
  const heroCoverUrl = publicDisplayImageUrl(heroBase);

  const availability: WeeklyAvailability = parseWeeklyAvailability(profile.weeklyAvailability);

  const filters: ContentSearchParams = {
    q: searchParams.q,
    tag: searchParams.tag,
    type: (searchParams.type as ContentFilterType) || "all",
    therapistUserId: profile.user.id,
  };

  const visibleProducts = products.filter((p) => contentVisibleForViewer(p.audience, viewer));
  const visibleArticles = articles.filter((a) => contentVisibleForViewer(a.audience, viewer));

  const filteredProducts = visibleProducts.filter((p) =>
    filterProductRow({ ...p, therapistId: p.therapistId ?? profile.user.id }, filters),
  );
  const filteredArticles = visibleArticles.filter((a) => filterArticleRow(a, filters));

  const booked = expandBookedAppointments(bookedAppointments);

  const showSupervision =
    profile.acceptsSupervisionRequests && profile.supervisionHourlyRate != null && Number(profile.supervisionHourlyRate) > 0;

  const publicEmail = contact.email?.trim();
  const requestMailto =
    publicEmail && isProbablyValidEmail(publicEmail)
      ? `${buildMailto(publicEmail)}?subject=${encodeURIComponent("בקשת פגישה")}`
      : null;

  const waHref = contact.whatsapp ? buildWhatsAppHref(contact.whatsapp) : null;
  const phoneHref = contact.phone?.trim() ? buildTelHref(contact.phone.trim()) : null;
  const bookAppointmentHref = profile.showPublicCalendar
    ? "#therapist-booking"
    : requestMailto ?? waHref ?? phoneHref ?? null;

  const referralTracking =
    viewer?.userId &&
    viewer.userId !== profile.user.id &&
    viewer.role === "client"
      ? {
          therapistProfileId: profile.id,
          therapistUserId: profile.user.id,
          viewerUserId: viewer.userId,
          viewerRole: viewer.role,
        }
      : null;

  return (
    <article className="mx-auto w-full max-w-[1320px] px-0 pb-12 pt-0 sm:px-4 sm:pb-16 md:px-6" dir="rtl">
      <header className="mx-auto w-full max-w-[920px] overflow-hidden rounded-none shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)] sm:rounded-[2rem] sm:shadow-xl">
        <TherapistProfileHero
          heroCoverUrl={heroCoverUrl}
          profileImageSeed={`therapist-${profile.id}`}
          therapistName={profile.user.name}
          serviceCity={city}
          specialties={specs}
          contact={contact}
          social={social}
          publicTherapistTitle={publicTherapistTitle}
          bookAppointmentHref={bookAppointmentHref}
          referralTracking={referralTracking}
        />
      </header>

      {profile.bio?.trim() ? (
        <div className="mx-auto w-full max-w-5xl px-4 py-6 text-right sm:px-6 sm:py-8">
          <p className="whitespace-pre-wrap text-base leading-[1.85] text-neutral-700 md:text-lg">{profile.bio.trim()}</p>
        </div>
      ) : null}

      <div className="mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8">
        <Suspense fallback={<div className="h-24 animate-pulse rounded-2xl bg-herbal-50" />}>
          <ContentSearchFilter
            therapistUserId={profile.user.id}
            basePath={`/therapists/${profile.id}`}
            variant="therapist"
            className="mb-10"
          />
        </Suspense>

        <TherapistOfferingSections products={filteredProducts} />

        <Suspense fallback={<div className="mt-14 h-32 animate-pulse rounded-2xl bg-herbal-50" />}>
          <TherapistAppointmentCalendar
            therapistUserId={profile.user.id}
            therapistProfileId={profile.id}
            availability={availability}
            openUntil={openUntil}
            booked={booked}
            enabled={profile.showPublicCalendar}
            requestMailto={requestMailto}
          />
        </Suspense>

        {showSupervision ? (
          <section className="mt-12 border-t border-neutral-200/90 pt-10" aria-labelledby="supervision-heading">
            <p id="supervision-heading" className={sectionLabel}>
              השגחה מקצועית
            </p>
            <p className="mt-4 text-base leading-relaxed text-neutral-700">
              המטפל/ת מאשר/ת פניות להשגחה מקצועית. תעריף לשעת עבודה:{" "}
              <span className="font-semibold text-herbal-900">{moneyIls(Number(profile.supervisionHourlyRate))}</span>
            </p>
          </section>
        ) : null}

        {filteredArticles.length > 0 ? (
          <section className="mt-14 border-t border-neutral-200/90 pt-12" aria-labelledby="articles-heading">
            <p id="articles-heading" className={sectionLabel}>
              מאמרים שפורסמו
            </p>
            <div
              className="hero-vision-hide-scrollbar mt-6 flex gap-4 overflow-x-auto pb-2 pt-1 [-webkit-overflow-scrolling:touch]"
              dir="ltr"
              style={{ scrollSnapType: "x proximity" }}
            >
              {filteredArticles.map((a) => (
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
      </div>
    </article>
  );
}
