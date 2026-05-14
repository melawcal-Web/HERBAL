"use client";

import { useState } from "react";

type Props = {
  imageUrl: string | null;
  fallbackLetter: string;
};

/**
 * Hero photo with optional color view — default matches site B&W treatment (`.cursorrules`).
 */
export function TherapistProfileHero({ imageUrl, fallbackLetter }: Props) {
  const [showColor, setShowColor] = useState(false);

  if (!imageUrl) {
    return (
      <div className="flex h-full min-h-[280px] items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-950">
        <span className="font-display text-[clamp(4rem,18vw,8rem)] font-bold text-white/15">{fallbackLetter}</span>
      </div>
    );
  }

  const toneClass = showColor ? "grayscale-0" : "therapist-photo-bw";

  return (
    <div className="relative h-full min-h-0 w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt=""
        className={`h-full w-full object-cover object-center transition-[filter] duration-500 ease-out motion-reduce:transition-none ${toneClass}`}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/25 to-transparent p-3 sm:p-4" />
      <div className="absolute end-3 top-3 sm:end-4 sm:top-4">
        <button
          type="button"
          aria-pressed={showColor}
          onClick={() => setShowColor((v) => !v)}
          className="pointer-events-auto rounded-full border border-white/40 bg-black/35 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md transition hover:bg-black/50 sm:text-xs"
        >
          {showColor ? "שחור־לבן" : "צבע מלא"}
        </button>
      </div>
    </div>
  );
}
