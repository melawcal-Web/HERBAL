"use client";

import type { ParsedContactInfo, ParsedSocialLinks } from "@/lib/therapist-contact";
import { TherapistHeroSocialBar } from "@/components/therapist/TherapistHeroSocialBar";
import { useState } from "react";

type Props = {
  /** תמונת רקע — תמיד כתובת https (כולל placeholder מהשרת) */
  heroCoverUrl: string;
  therapistName: string;
  /** שם העיר בלבד */
  serviceCity: string | null;
  specialties: string[];
  contact: ParsedContactInfo;
  social: ParsedSocialLinks;
  publicTherapistTitle: "male" | "female";
};

const titleLine =
  "text-[10px] font-black uppercase tracking-[0.22em] text-herbal-300 drop-shadow-[0_0_16px_rgba(74,222,128,0.9)] sm:text-[11px]";

/**
 * Hero: תמונת רקע + שני טורים בתחתית (RTL):
 * ימין — כותרת מקצועית בירוק, שם, עיר.
 * שמאל — פילי התמחות, מתחתיהם כל אייקוני הקשר כולל טלפון בשורה אחת.
 */
export function TherapistProfileHero({
  heroCoverUrl,
  therapistName,
  serviceCity,
  specialties,
  contact,
  social,
  publicTherapistTitle,
}: Props) {
  const [showColor, setShowColor] = useState(false);

  const toneClass = showColor ? "grayscale-0" : "therapist-photo-bw";
  const roleHe = publicTherapistTitle === "male" ? "מטפל בצמחי מרפא" : "מטפלת בצמחי מרפא";

  return (
    <div className="relative min-h-[min(68vh,560px)] w-full overflow-hidden bg-neutral-950 md:min-h-[min(72vh,640px)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={heroCoverUrl}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover object-[center_22%] transition-[filter] duration-500 ease-out motion-reduce:transition-none ${toneClass}`}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/55 via-45% to-black/25" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/50 via-transparent to-transparent opacity-90 md:opacity-100" />

      <div className="absolute end-3 top-3 z-20 sm:end-5 sm:top-5">
        <button
          type="button"
          aria-pressed={showColor}
          onClick={() => setShowColor((v) => !v)}
          className="pointer-events-auto rounded-full border border-white/35 bg-black/40 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md transition hover:bg-black/55 sm:text-xs"
        >
          {showColor ? "שחור־לבן" : "צבע מלא"}
        </button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-5 pb-8 pt-20 text-right sm:px-8 sm:pb-10 sm:pt-24 md:px-12 md:pb-12">
        <div className="mx-auto max-w-5xl">
          {/*
            ב־RTL: פריט ראשון בשורה = צד ימין של המסך — בלוק השם.
            פריט שני = צד שמאל — פילים + אייקונים.
          */}
          <div className="pointer-events-auto flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div
              className="flex min-w-0 flex-col items-end text-right"
              style={{ textShadow: "0 2px 18px rgba(0,0,0,0.88)" }}
            >
              <span className={titleLine}>{roleHe}</span>
              <span className="mt-2 font-display text-2xl font-bold leading-tight text-white sm:text-3xl md:text-[clamp(1.85rem,3.2vw,2.75rem)]">
                {therapistName}
              </span>
              {serviceCity ? (
                <span className="mt-1.5 text-base font-semibold text-white/95 sm:text-lg">{serviceCity}</span>
              ) : null}
            </div>

            <div className="flex min-w-0 max-w-full flex-col items-start gap-3 sm:max-w-[min(100%,22rem)]">
              {specialties.length > 0 ? (
                <ul className="flex flex-wrap justify-start gap-1.5">
                  {specialties.map((s) => (
                    <li
                      key={s}
                      className="rounded-full border border-white/35 bg-black/35 px-2.5 py-0.5 text-[10px] font-semibold text-white/95 backdrop-blur-sm sm:px-3 sm:py-1 sm:text-xs"
                      style={{ textShadow: "0 1px 8px rgba(0,0,0,0.75)" }}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              ) : null}
              <TherapistHeroSocialBar contact={contact} social={social} className="w-full justify-start" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
