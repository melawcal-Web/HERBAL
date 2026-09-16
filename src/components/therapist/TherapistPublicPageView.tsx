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
import { therapistAvatarSrc } from "@/lib/therapist-avatar";
import { parseTherapistPaymentSettings } from "@/lib/therapist-payments";
import type { WaitlistProductModel } from "@/components/products/WaitlistProductCard";
import { expandBookedAppointments, parseWeeklyAvailability, type WeeklyAvailability } from "@/lib/therapist-availability";
import {
  filterProductRow,
  type ContentSearchParams,
} from "@/lib/content-search";
import { contentVisibleForViewer, type ContentViewer } from "@/lib/content-audience";
import type { ContentFilterType } from "@/components/search/ContentSearchFilter";
import { storedImageSrc } from "@/lib/stored-image-url";

type UserPick = Pick<User, "id" | "name" | "image">;
export type TherapistPublicProfile = TherapistProfile & { user: UserPick };

type PortfolioTimelineItem = { yearFrom: number; yearTo?: number | null; description: string };

function parsePortfolioTimeline(raw: unknown): PortfolioTimelineItem[] {
  if (!Array.isArray(raw)) return [];
  const out: PortfolioTimelineItem[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const yearFromRaw = o.yearFrom;
    const yearToRaw = o.yearTo;
    const descRaw = o.description;
    const yearFrom =
      typeof yearFromRaw === "number" && Number.isFinite(yearFromRaw)
        ? Math.floor(yearFromRaw)
        : typeof yearFromRaw === "string" && yearFromRaw.trim()
          ? Number(yearFromRaw.trim())
          : NaN;
    const yearTo =
      typeof yearToRaw === "number" && Number.isFinite(yearToRaw)
        ? Math.floor(yearToRaw)
        : typeof yearToRaw === "string" && yearToRaw.trim()
          ? Number(yearToRaw.trim())
          : null;
    const description = typeof descRaw === "string" ? descRaw.trim() : "";
    if (!Number.isFinite(yearFrom) || !description) continue;
    out.push({ yearFrom, yearTo: yearTo != null && Number.isFinite(yearTo) ? Math.floor(yearTo) : null, description });
  }
  out.sort((a, b) => b.yearFrom - a.yearFrom);
  return out;
}

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
  bookedAppointments?: { slotStart: Date; slotEnd: Date; recurringWeekly: boolean; status: string; kind?: "time_slot" | "open_inquiry" }[];
  viewer?: ContentViewer | null;
}) {
  const contact = parseContactInfo(profile.contactInfo);
  const social = parseSocialLinks(profile.socialLinks);
  const specs = specialtyList(profile.specialty1, profile.specialty2, profile.specialty3);
  const city = contact.city?.trim() || null;
  const publicTherapistTitle = profile.publicTherapistTitle === "male" ? "male" : "female";

  const heroCoverUrl = therapistAvatarSrc(profile.user.image, profile.id);
  const paymentSettings = parseTherapistPaymentSettings(profile.paymentSettings);

  const availability: WeeklyAvailability = parseWeeklyAvailability(profile.weeklyAvailability);
  const timeline = parsePortfolioTimeline(profile.portfolioTimeline);

  const filters: ContentSearchParams = {
    q: searchParams.q,
    tag: searchParams.tag,
    type: (searchParams.type as ContentFilterType) || "all",
    therapistUserId: profile.user.id,
  };

  const visibleProducts = products.filter((p) => contentVisibleForViewer(p.audience, viewer));

  const filteredProducts = visibleProducts.filter((p) =>
    filterProductRow({ ...p, therapistId: p.therapistId ?? profile.user.id }, filters),
  );

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
          therapistName={profile.user.name}
          serviceCity={city}
          specialties={specs}
          contact={contact}
          social={social}
          publicTherapistTitle={publicTherapistTitle}
          bookAppointmentHref={bookAppointmentHref}
          timeline={timeline}
          referralTracking={referralTracking}
        />
      </header>

      <div className="mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8">
        <section className="text-right" aria-labelledby="about-heading">
          <p id="about-heading" className={sectionLabel}>
            אודות
          </p>
          {profile.bio?.trim() ? (
            <p className="mt-4 whitespace-pre-wrap text-base leading-[1.85] text-neutral-700 md:text-lg">
              {profile.bio.trim()}
            </p>
          ) : (
            <p className="mt-4 text-sm text-slate-500">טרם נוסף תיאור רקע.</p>
          )}
        </section>

        <section className="mt-12 border-t border-neutral-200/90 pt-10" aria-labelledby="articles-heading">
          <p id="articles-heading" className={sectionLabel}>
            מאמרים שפורסמו
          </p>
          {articles.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">אין מאמרים שפורסמו עדיין.</p>
          ) : (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {articles.map((a) => {
                const cover = storedImageSrc(a.coverImageUrl);
                return (
                  <li key={a.id}>
                    <Link
                      href={`/herbal-index/${a.slug}`}
                      className="flex h-full overflow-hidden rounded-2xl border border-herbal-100 bg-white shadow-sm transition hover:border-herbal-300 hover:shadow-md"
                    >
                      <div className="aspect-[4/3] w-[7.5rem] shrink-0 bg-herbal-50 sm:w-36">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cover} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-medium text-herbal-600">
                            מאמר
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 p-4 text-right">
                        <h3 className="font-display text-base font-bold text-herbal-900">{a.title}</h3>
                        {a.category ? <p className="mt-1 text-[11px] font-semibold text-herbal-700">{a.category}</p> : null}
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{a.excerpt}</p>
                        <span className="mt-3 inline-block text-xs font-semibold text-herbal-700">לקריאה</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <Suspense fallback={<div className="mt-10 h-24 animate-pulse rounded-2xl bg-herbal-50" />}>
          <ContentSearchFilter
            therapistUserId={profile.user.id}
            basePath={`/therapists/${profile.id}`}
            variant="therapist"
            className="mb-10 mt-12"
          />
        </Suspense>

        <TherapistOfferingSections products={filteredProducts} paymentSettings={paymentSettings} />

        <Suspense fallback={<div className="mt-14 h-32 animate-pulse rounded-2xl bg-herbal-50" />}>
          <TherapistAppointmentCalendar
            therapistUserId={profile.user.id}
            therapistProfileId={profile.id}
            availability={availability}
            calendarDefinitionsRaw={profile.calendarSlotDefinitions}
            booked={booked}
            enabled={profile.showPublicCalendar}
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
      </div>
    </article>
  );
}
