"use client";

import type { ParsedContactInfo, ParsedSocialLinks } from "@/lib/therapist-contact";
import { TherapistHeroSocialBar } from "@/components/therapist/TherapistHeroSocialBar";
import { useState } from "react";

type Props = {
  imageUrl: string | null;
  fallbackLetter: string;
  therapistName: string;
  /** אזור פעילות / מיקום קליני */
  serviceCity: string | null;
  specialties: string[];
  contact: ParsedContactInfo;
  social: ParsedSocialLinks;
};

/**
 * Hero: full-bleed photo (default B&W per design system) + optional color toggle.
 * High-contrast overlay: name, location, specialties.
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

      <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-10 pt-24 text-right sm:px-10 sm:pb-12 sm:pt-32 md:px-12 md:pb-14">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.32em] text-emerald-200/95 sm:text-[11px]"
          style={{ textShadow: "0 2px 14px rgba(0,0,0,0.85)" }}
        >
          מטפל/ת צמחי מרפא
        </p>
        <h1
          className="mt-3 font-display text-[clamp(2rem,6.5vw,3.75rem)] font-bold leading-[1.05] tracking-tight text-white md:text-[clamp(2.5rem,4.2vw,4.25rem)]"
          style={{ textShadow: "0 4px 28px rgba(0,0,0,0.9),0 1px 3px rgba(0,0,0,1)" }}
        >
          {therapistName}
        </h1>
        {serviceCity ? (
          <p
            className="mt-3 text-base font-semibold text-white/95 sm:text-lg"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.85)" }}
          >
            אזור עבודה · {serviceCity}
          </p>
        ) : null}
        {specialties.length > 0 ? (
          <ul className="mt-5 flex max-w-3xl flex-wrap justify-end gap-2 sm:mt-6 sm:gap-2.5">
            {specialties.map((s) => (
              <li
                key={s}
                className="rounded-full border border-white/35 bg-black/40 px-3 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-md sm:px-4 sm:py-2 sm:text-sm"
                style={{ textShadow: "0 1px 8px rgba(0,0,0,0.75)" }}
              >
                {s}
              </li>
            ))}
          </ul>
        ) : null}
        <TherapistHeroSocialBar contact={contact} social={social} />
      </div>
    </div>
  );
}
