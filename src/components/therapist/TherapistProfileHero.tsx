import type { ParsedContactInfo, ParsedSocialLinks } from "@/lib/therapist-contact";
import { formatTimelineYears, type PortfolioTimelineEntry } from "@/lib/portfolio-timeline";
import { TherapistHeroSocialBar } from "@/components/therapist/TherapistHeroSocialBar";
import { ProfileAvatar } from "@/components/dashboard/ProfileAvatar";

type Props = {
  /** תמונת כיסוי — גם העיגול מציג אותה בצבע מלא */
  heroCoverUrl: string;
  profileImageSeed: string;
  therapistName: string;
  /** שם העיר בלבד */
  serviceCity: string | null;
  specialties: string[];
  contact: ParsedContactInfo;
  social: ParsedSocialLinks;
  publicTherapistTitle: "male" | "female";
  portfolioTimeline: PortfolioTimelineEntry[];
};

function clip(s: string, max: number) {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

const roleLine =
  "text-[10px] font-black uppercase tracking-[0.22em] text-herbal-600 sm:text-[11px]";

/**
 * Hero דו־עמודתי (RTL): ימין — שם, תפקיד, עיר, תמונה בעיגול מתוך כיסוי הצבע.
 * שמאל — פאנל ירוק עם ציר זמן ואייקונים (ללא גלילה אופקית).
 */
export function TherapistProfileHero({
  heroCoverUrl,
  profileImageSeed,
  therapistName,
  serviceCity,
  specialties,
  contact,
  social,
  publicTherapistTitle,
  portfolioTimeline,
}: Props) {
  const roleHe = publicTherapistTitle === "male" ? "מטפל בצמחי מרפא" : "מטפלת בצמחי מרפא";

  return (
    <div
      className="relative flex min-h-[min(52vh,480px)] w-full flex-col overflow-hidden bg-neutral-50 md:min-h-[min(58vh,540px)] md:flex-row"
      dir="rtl"
    >
      {/* עמודת שם — מוצגת מימין (פריט ראשון ב־RTL) */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-6 py-10 text-center sm:items-end sm:px-10 sm:py-12 sm:text-right md:py-14">
        <ProfileAvatar
          imageUrl={heroCoverUrl}
          name={therapistName}
          seed={profileImageSeed}
          size="xl"
          imageTreatment="natural"
          className="mb-3 shadow-xl ring-4 ring-herbal-200/80 !aspect-square"
        />
        <span className={roleLine}>{roleHe}</span>
        <span className="mt-1.5 font-display text-2xl font-bold leading-tight text-herbal-950 sm:text-3xl md:text-[clamp(1.85rem,3vw,2.65rem)]">
          {therapistName}
        </span>
        {serviceCity ? <span className="mt-1 text-base font-semibold text-herbal-800 sm:text-lg">{serviceCity}</span> : null}
      </div>

      {/* עמודה ירוקה — משמאל; תוכן מצומצם לרוחב ומיושר לקצה הפנימי */}
      <div
        className="relative flex min-h-[min(40vh,360px)] flex-1 flex-col justify-end border-t border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-teal-50/95 to-lime-50/90 px-5 pb-8 pt-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] sm:min-h-0 sm:max-w-[min(100%,26rem)] sm:border-t-0 sm:border-s sm:border-emerald-200/70 sm:px-7 sm:pb-10 sm:pt-12 md:max-w-[min(100%,28rem)]"
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

            {portfolioTimeline.length > 0 ? (
              <div className={specialties.length > 0 ? "mt-4" : ""}>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-900/65">ציר זמן — תקופות</p>
                <ul className="mt-3 space-y-2 text-sm text-emerald-950">
                  {portfolioTimeline.map((e) => (
                    <li
                      key={e.id}
                      className="flex flex-wrap items-baseline gap-2 border-b border-emerald-200/40 pb-2 text-right last:border-0 last:pb-0"
                    >
                      <span className="shrink-0 font-mono text-xs font-bold text-emerald-800" dir="ltr">
                        {formatTimelineYears(e) || "—"}
                      </span>
                      {e.description.trim() ? (
                        <span className="text-xs leading-snug text-emerald-900/90">{clip(e.description, 80)}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className={`text-sm text-emerald-900/75 ${specialties.length > 0 ? "mt-4" : ""}`}>אין תקופות שסומנו בציר הזמן.</p>
            )}

            <div className="mt-4 w-full" dir="ltr">
              <TherapistHeroSocialBar contact={contact} social={social} className="justify-start" surface="light" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
