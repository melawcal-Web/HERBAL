"use client";

import type { ParsedContactInfo, ParsedSocialLinks } from "@/lib/therapist-contact";
import { TherapistHeroSocialBar } from "@/components/therapist/TherapistHeroSocialBar";
import { useState } from "react";

type Props = {
  imageUrl: string | null;
  fallbackLetter: string;
  therapistName: string;
  /** שם העיר בלבד */
  serviceCity: string | null;
  specialties: string[];
  contact: ParsedContactInfo;
  social: ParsedSocialLinks;
};

/**
 * Hero: full-bleed photo (B&W default) + bottom band aligning title, name, city, tags, and overlay contact icons.
 */
export function TherapistProfileHero({
  imageUrl,
  fallbackLetter,
  therapistName,
  serviceCity,
  specialties,
  contact,
  social,
}: Props) {
  const [showColor, setShowColor] = useState(false);

  const toneClass = showColor ? "grayscale-0" : "therapist-photo-bw";

  return (
    <div className="relative min-h-[min(72vh,640px)] w-full overflow-hidden bg-neutral-950 md:min-h-[min(78vh,720px)]">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover object-[center_22%] transition-[filter] duration-500 ease-out motion-reduce:transition-none ${toneClass}`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-950">
          <span className="font-display text-[clamp(4rem,20vw,9rem)] font-bold text-white/15">{fallbackLetter}</span>
        </div>
      )}

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

      <TherapistHeroSocialBar contact={contact} social={social} />

      {/* Bottom band: identity + pills share one horizontal visual region; icons sit on lowest row */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-5 pb-[4.25rem] pt-24 text-right sm:px-8 sm:pb-[4.5rem] sm:pt-28 md:px-12 md:pb-24 md:pt-32">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-stretch gap-5 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="md:max-w-[58%]">
            <p
              className="text-[11px] font-medium tracking-[0.18em] text-white/88 sm:text-xs"
              style={{ textShadow: "0 2px 14px rgba(0,0,0,0.85)" }}
            >
              מטפל/ת בצמחי מרפא
            </p>
            <h1
              className="mt-2 font-display text-[clamp(2.15rem,6.2vw,3.85rem)] font-bold leading-[1.04] tracking-tight text-white md:text-[clamp(2.45rem,3.8vw,4.1rem)]"
              style={{ textShadow: "0 4px 28px rgba(0,0,0,0.9),0 1px 3px rgba(0,0,0,1)" }}
            >
              {therapistName}
            </h1>
            {serviceCity ? (
              <p
                className="mt-2 text-lg font-semibold text-white/95 sm:text-xl"
                style={{ textShadow: "0 2px 16px rgba(0,0,0,0.85)" }}
              >
                {serviceCity}
              </p>
            ) : null}
          </div>

          {specialties.length > 0 ? (
            <ul className="flex flex-wrap justify-center gap-2 md:max-w-[42%] md:justify-end md:pb-1">
              {specialties.map((s) => (
                <li
                  key={s}
                  className="rounded-full border border-white/40 bg-white/12 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-md sm:px-4 sm:py-2 sm:text-sm"
                  style={{ textShadow: "0 1px 10px rgba(0,0,0,0.75)" }}
                >
                  {s}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
