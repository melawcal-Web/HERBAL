"use client";

import type { ReactNode } from "react";
import {
  buildFacebookHref,
  buildInstagramHref,
  buildMailto,
  buildTelHref,
  buildTikTokHref,
  buildWhatsAppHref,
  isProbablyValidEmail,
  type ParsedContactInfo,
  type ParsedSocialLinks,
} from "@/lib/therapist-contact";

import { buildWebsiteHref } from "@/lib/therapist-contact";

const iconClass =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/35 bg-black/40 text-white shadow-[0_2px_12px_rgba(0,0,0,0.45)] backdrop-blur-sm transition hover:bg-black/55 hover:border-white/50 motion-reduce:transition-none sm:h-11 sm:w-11";

function IconGlobe({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

function iconWrap(href: string, label: string, children: React.ReactNode) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={iconClass}
    >
      {children}
    </a>
  );
}

function IconTikTok({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  );
}

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function IconPhone({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function IconMail({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

/**
 * שורה אחת של אייקוני קשר — מתחת לפילים (בתוך עמודת הטקסט ב-hero).
 */
export function TherapistHeroSocialBar({
  contact,
  social,
  className = "",
}: {
  contact: ParsedContactInfo;
  social: ParsedSocialLinks;
  className?: string;
}) {
  const wa = contact.whatsapp ? buildWhatsAppHref(contact.whatsapp) : null;
  const phone = contact.phone?.trim();
  const email = contact.email?.trim();
  const site = social.website?.trim() ? buildWebsiteHref(social.website) : null;
  const ig = social.instagram ? buildInstagramHref(social.instagram) : null;
  const fb = social.facebook ? buildFacebookHref(social.facebook) : null;
  const tt = social.tiktok ? buildTikTokHref(social.tiktok) : null;

  const items: ReactNode[] = [];
  if (site) items.push(iconWrap(site, "אתר אינטרנט", <IconGlobe className="h-5 w-5" />));
  if (tt) items.push(iconWrap(tt, "טיקטוק", <IconTikTok className="h-5 w-5" />));
  if (ig) items.push(iconWrap(ig, "אינסטגרם", <IconInstagram className="h-5 w-5" />));
  if (fb) items.push(iconWrap(fb, "פייסבוק", <IconFacebook className="h-5 w-5" />));
  if (wa) items.push(iconWrap(wa, "וואטסאפ", <IconWhatsApp className="h-5 w-5" />));
  if (phone) items.push(iconWrap(buildTelHref(phone), "טלפון", <IconPhone className="h-[1.05rem] w-[1.05rem] sm:h-5 sm:w-5" />));
  if (email && isProbablyValidEmail(email)) {
    items.push(iconWrap(buildMailto(email), "אימייל", <IconMail className="h-5 w-5" />));
  }

  if (items.length === 0) return null;

  return (
    <div
      className={`flex flex-nowrap items-center gap-2 overflow-x-auto py-1 [-webkit-overflow-scrolling:touch] ${className}`}
      aria-label="יצירת קשר"
      dir="ltr"
    >
      {items}
    </div>
  );
}
