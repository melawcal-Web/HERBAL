"use client";

import { useState } from "react";

export function OptionalCoverImage({ src, className }: { src: string; className?: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={className} onError={() => setOk(false)} />
  );
}
