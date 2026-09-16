import type { ParsedContactInfo, ParsedSocialLinks } from "@/lib/therapist-contact";
import { TherapistHeroSocialBar, type HeroReferralTracking } from "@/components/therapist/TherapistHeroSocialBar";

type Props = {
  /** תמונת פרופיל — אותה כתובת כמו בדף הבית ובקרוסלה */
  heroCoverUrl: string;
  therapistName: string;
  /** שם העיר בלבד */
  serviceCity: string | null;
  specialties: string[];
  contact: ParsedContactInfo;
  social: ParsedSocialLinks;
  publicTherapistTitle: "male" | "female";
  /** יומן (#therapist-booking), mailto, וואטסאפ או טלפון */
  bookAppointmentHref: string | null;
  /** ציר זמן ניסיון/השכלה (נרשם בפרופיל המטפל) */
  timeline?: { yearFrom: number; yearTo?: number | null; description: string }[];
  referralTracking?: HeroReferralTracking | null;
};

const roleLine =
  "text-[10px] font-black uppercase tracking-[0.22em] text-emerald-200/95 sm:text-[11px]";

/**
 * Hero: תמונת פרופיל במסך מלא (B&W כמו בבית ובקרוסלה) + פאנל פרטים מתחתיה.
 */
export function TherapistProfileHero({
  heroCoverUrl,
  therapistName,
  serviceCity,
  specialties,
  contact,
  social,
  publicTherapistTitle,
  bookAppointmentHref,
  timeline = [],
  referralTracking,
}: Props) {
  const roleHe = publicTherapistTitle === "male" ? "מטפל בצמחי מרפא" : "מטפלת בצמחי מרפא";

  const safeTimeline = timeline
    .filter((x) => Number.isFinite(x.yearFrom) && typeof x.description === "string" && x.description.trim().length > 0)
    .slice(0, 8);

  return (
    <div className="relative w-full overflow-hidden bg-neutral-950" dir="rtl">
      <div className="relative min-h-[min(52vh,480px)] w-full md:min-h-[min(58vh,560px)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroCoverUrl}
          alt={therapistName}
          className="therapist-photo-bw absolute inset-0 h-full w-full object-cover object-center contrast-[1.06]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-6 text-right sm:px-8 sm:pb-8">
          <p className={roleLine}>{roleHe}</p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-white drop-shadow-md sm:text-4xl">
            {therapistName}
          </h1>
          {serviceCity ? (
            <p className="mt-1.5 text-base font-semibold text-white/95 sm:text-lg">{serviceCity}</p>
          ) : null}
          {bookAppointmentHref ? (
            <a
              href={bookAppointmentHref}
              className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full bg-herbal-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-herbal-500"
            >
              קבע פגישה
            </a>
          ) : null}
        </div>
      </div>

      <div
        className="relative flex min-h-0 min-w-0 flex-col justify-end border-t border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-teal-50/95 to-lime-50/90 px-5 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] sm:px-6 sm:py-9 md:px-7 md:py-10"
        dir="rtl"
      >
        <div className="pointer-events-none absolute -left-16 -top-12 h-44 w-44 rounded-full bg-lime-300/25 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-10 -right-8 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" aria-hidden />

        <div className="relative z-10 flex w-full flex-col items-end gap-5">
          <div className="w-full max-w-md">
            {specialties.length > 0 ? (
              <ul className="flex flex-wrap justify-end gap-1.5 sm:gap-2">
                {specialties.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-emerald-300/60 bg-white/75 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-900 shadow-sm backdrop-blur-sm sm:px-3 sm:py-1 sm:text-xs"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            ) : null}

            {safeTimeline.length > 0 ? (
              <div className={`w-full ${specialties.length > 0 ? "mt-4" : ""}`}>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700/90">ניסיון והכשרה</p>
                <ul className="mt-2 space-y-2">
                  {safeTimeline.map((row, idx) => {
                    const y1 = Math.floor(row.yearFrom);
                    const y2 = row.yearTo != null ? Math.floor(row.yearTo) : null;
                    const range = y2 && y2 !== y1 ? `${y1}–${y2}` : `${y1}`;
                    return (
                      <li key={`${range}-${idx}`} className="rounded-xl border border-emerald-200/70 bg-white/70 px-3 py-2 shadow-sm">
                        <p className="text-xs font-bold text-emerald-900" dir="ltr">
                          {range}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-700">{row.description.trim()}</p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}

            <div className={`w-full ${specialties.length > 0 || safeTimeline.length > 0 ? "mt-4" : ""}`} dir="ltr">
              <TherapistHeroSocialBar
                contact={contact}
                social={social}
                className="justify-start"
                surface="light"
                referralTracking={referralTracking ?? undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
